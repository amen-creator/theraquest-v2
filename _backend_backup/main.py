import os
import json
import asyncio
import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from backend.schemas import UserInteraction, InteractionResponse
from backend.agents.pipeline import run_full_pipeline, stream_pipeline
from backend.db import persist_session, get_user_history

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("amaterasu")

GROQ_MODEL = "llama-3.3-70b-versatile"

def get_client():
    return AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Amaterasu Pipeline v2.0 starting...")
    yield
    logger.info("🛑 Amaterasu Pipeline shutting down...")


app = FastAPI(
    title="TheraQuest — Amaterasu Enterprise Pipeline",
    description="Multi-Agent System for Gamified CBT Mental Wellness",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/")
def health():
    return {"status": "operational", "pipeline": "Amaterasu v2.0", "agents": 5, "timestamp": datetime.now(timezone.utc).isoformat()}

# ── Main MAS Pipeline ─────────────────────────────────────────────────────────
@app.post("/api/interact", response_model=InteractionResponse)
async def interact(data: UserInteraction):
    try:
        return await run_full_pipeline(data.user_id, data.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interact/stream")
async def interact_stream(data: UserInteraction):
    async def event_generator():
        async for chunk in stream_pipeline(data.user_id, data.message, image_data=data.image_data):
            yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")

# ── CBT Exercises: Thought Record Analysis ────────────────────────────────────
class ThoughtRecordInput(BaseModel):
    situation: str
    emotion: str
    autoThought: str
    evFor: str
    evAgainst: str
    balanced: str

@app.post("/api/exercises/thought")
async def analyze_thought_record(data: ThoughtRecordInput):
    client = get_client()
    prompt = f"""You are a compassionate CBT therapist. A patient has completed a thought record:
Situation: {data.situation}
Emotions: {data.emotion}
Automatic Thought: {data.autoThought}
Evidence FOR: {data.evFor}
Evidence AGAINST: {data.evAgainst}
Balanced Thought: {data.balanced}

Provide a brief, warm analysis (3-4 sentences max). Validate their effort, name any cognitive distortions detected (e.g., catastrophizing, all-or-nothing thinking), and affirm their balanced thought. Be warm and clinical."""
    try:
        r = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300, temperature=0.5
        )
        return {"analysis": r.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Recovery Planner ──────────────────────────────────────────────────────────
class PlannerInput(BaseModel):
    concerns: str
    goals: str
    approach: str

@app.post("/api/planner")
async def generate_plan(data: PlannerInput):
    client = get_client()
    prompt = f"""You are an elite CBT therapist creating a detailed 7-day recovery plan.
Main concerns: {data.concerns}
Goals: {data.goals}
Therapeutic approach: {data.approach}

Create a structured 7-day plan with:
- Each day: Morning ritual (5 min), afternoon CBT exercise, evening reflection
- Specific CBT techniques by name (Thought Records, Behavioral Activation, etc.)
- Daily affirmation
- Progress tracking metric
Use markdown. Be warm, clinical, and highly specific."""
    try:
        r = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1800, temperature=0.4
        )
        return {"plan": r.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Wellness Quizzes ──────────────────────────────────────────────────────────
class QuizInput(BaseModel):
    topic: str
    num_questions: int = 5

@app.post("/api/quiz")
async def generate_quiz(data: QuizInput):
    client = get_client()
    prompt = f"""Generate {data.num_questions} multiple-choice questions testing knowledge of: {data.topic} in CBT/mental health context.
Return ONLY valid JSON array with no extra text:
[{{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"A","explanation":"..."}}]"""
    try:
        r = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=1500, temperature=0.3
        )
        raw = r.choices[0].message.content
        parsed = json.loads(raw)
        # Handle both array and object with 'questions' key
        questions = parsed if isinstance(parsed, list) else parsed.get("questions", [])
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Goal Coach ────────────────────────────────────────────────────────────────
class GoalInput(BaseModel):
    goal: str
    timeline: str

@app.post("/api/goals")
async def build_roadmap(data: GoalInput):
    client = get_client()
    prompt = f"""You are a senior CBT therapist and life coach.
Patient Goal: {data.goal}
Timeline: {data.timeline}

Create a structured, compassionate wellness roadmap:
1. Break the goal into 3 SMART milestones
2. For each milestone: specific CBT techniques, weekly habits, and progress metrics
3. Potential obstacles and how to overcome them (CBT-based strategies)
4. Final vision statement

Be warm, deeply specific, and practical. Use markdown formatting."""
    try:
        r = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1800, temperature=0.6
        )
        return {"roadmap": r.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── History ───────────────────────────────────────────────────────────────────
@app.get("/api/history/{user_id}")
async def get_history(user_id: str):
    try:
        history = await get_user_history(user_id)
        return {"user_id": user_id, "history": history}
    except Exception as e:
        return {"user_id": user_id, "history": [], "error": str(e)}

# ── WebSocket ─────────────────────────────────────────────────────────────────
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            async for chunk in stream_pipeline(user_id, payload.get("message", "")):
                await websocket.send_text(json.dumps(chunk))
            await websocket.send_text(json.dumps({"type": "done"}))
    except WebSocketDisconnect:
        logger.info(f"[WebSocket] Disconnected: {user_id}")
