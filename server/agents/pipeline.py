import os
import json
import logging
import asyncio
from typing import AsyncGenerator
from groq import AsyncGroq
from schemas import TherapistOutput, QuestOutput, InteractionResponse
from agents.nimble_agent import run_nimble_agent
from agents.vision_agent import run_vision_agent
from agents.memory_agent import run_memory_agent

logger = logging.getLogger("amaterasu.pipeline")

GROQ_MODEL = "llama-3.3-70b-versatile"

def get_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set in environment variables.")
    return AsyncGroq(api_key=api_key)

async def call_agent(prompt: str, agent_name: str) -> dict:
    client = get_client()
    logger.info(f"Invoking {agent_name}...")
    completion = await client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(completion.choices[0].message.content)


async def run_full_pipeline(user_id: str, message: str, nimble_context: str = None, nimble_sources: list = None, biometric_context: str = None, memory_context: str = None) -> InteractionResponse:
    # ── 1. Therapist Agent (Enhanced with 4 context sources) ────────────────────
    context_addon = f"\n\nLive Web Context (Nimble Agent 4): {nimble_context}" if nimble_context else ""
    biometric_addon = f"\n\nBiometric Vision Context (Agent 5): The user appears to be {biometric_context}. Acknowledge this empathetically." if biometric_context else ""
    memory_addon = f"\n\nLong-Term Memory Context (Agent 6): {memory_context}. Reference this context naturally in your reply if relevant." if memory_context else ""
    t_prompt = f"""You are Agent 1: The CBT Therapist. Analyze the user's message: "{message}"{memory_addon}{biometric_addon}{context_addon}
Extract sentiment, engagement_score (0.0-1.0), anxiety_score (0.0-1.0), cognitive_distortion, and write a therapist_reply.
Return ONLY JSON matching:
{{
    "sentiment": "str",
    "engagement_score": float,
    "anxiety_score": float,
    "cognitive_distortion": "str or null",
    "therapist_reply": "str"
}}"""
    t_res = await call_agent(t_prompt, "Therapist Agent")
    therapist = TherapistOutput(**t_res)

    # ── 2. Quest Generator Agent ─────────────────────────────────────────────
    q_prompt = f"""You are Agent 2: Quest Generator. The user feels {therapist.sentiment} (Anxiety: {therapist.anxiety_score}, Distortion: {therapist.cognitive_distortion}).
Create a therapeutic quest to help them process this. Return ONLY JSON matching:
{{
    "quest_title": "str",
    "quest_lore": "str",
    "steps": [{{"description": "str", "xp_reward": int}}],
    "total_xp": int
}}"""
    q_res = await call_agent(q_prompt, "Quest Generator Agent")
    quest = QuestOutput(**q_res)

    # ── 3. Supervisor Agent ──────────────────────────────────────────────────
    s_prompt = f"""You are Agent 3: Supervisor. Validate the following response for safety.
Reply: {therapist.therapist_reply}
Quest: {quest.quest_title}
Check for hallucination, dangerous medical advice, or self-harm encouragement.
Return ONLY JSON matching:
{{
    "is_safe": bool,
    "reason": "str"
}}"""
    s_res = await call_agent(s_prompt, "Supervisor Agent")
    
    if not s_res.get("is_safe", True):
        logger.warning(f"Supervisor blocked response: {s_res.get('reason')}")
        raise ValueError(f"Safety violation: {s_res.get('reason')}")

    # ── 4. Persistence ───────────────────────────────────────────────────────
    from db import persist_session
    await persist_session(user_id, therapist, quest)

    return InteractionResponse(
        therapist_reply=therapist.therapist_reply,
        quest=quest,
        vector_metrics={"anxiety": therapist.anxiety_score, "engagement": therapist.engagement_score},
        nimble_sources=nimble_sources or []
    )

async def stream_pipeline(user_id: str, message: str, image_data: str = None) -> AsyncGenerator[dict, None]:
    """Streams status updates back to the UI with all 5 agents."""
    
    # ── Agent 5: Vision ──────────────────────────────────────────────────
    biometric_ctx = None
    if image_data:
        yield {"step": "vision", "status": "analyzing"}
        biometric_ctx = await run_vision_agent(image_data)
        yield {"step": "vision", "status": "done", "detected": biometric_ctx}

    # ── Agent 6: Memory ──────────────────────────────────────────────────
    yield {"step": "memory", "status": "retrieving"}
    memory_ctx = await run_memory_agent(user_id, message)
    yield {"step": "memory", "status": "done", "has_memory": bool(memory_ctx)}
    
    # ── Agent 4: Nimble Live Web ───────────────────────────────────────────
    yield {"step": "nimble", "status": "routing"}
    nimble_ctx, nimble_sources = await run_nimble_agent(message)
    if nimble_ctx:
        yield {"step": "nimble", "status": "extracting", "context_found": True}
    else:
        yield {"step": "nimble", "status": "done", "context_found": False}
        
    # ── Agents 1-3: Core MAS Pipeline ───────────────────────────────────────
    yield {"step": "therapist", "status": "running"}
    await asyncio.sleep(0.3)
    try:
        result = await run_full_pipeline(
            user_id, message,
            nimble_context=nimble_ctx,
            nimble_sources=nimble_sources,
            biometric_context=biometric_ctx,
            memory_context=memory_ctx
        )
        yield {"step": "complete", "status": "done", "result": result.model_dump()}
    except Exception as e:
        yield {"step": "error", "status": "failed", "detail": str(e)}
