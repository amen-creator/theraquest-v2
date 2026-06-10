import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_MODEL = "llama-3.3-70b-versatile"

def get_client():
    return Groq(api_key=os.environ.get("GROQ_API_KEY"))

def run_therapist_agent(user_message: str) -> dict:
    prompt = f"""You are an empathetic CBT therapist. Analyze the user message and respond in JSON.

User: "{user_message}"

Return ONLY valid JSON with these exact fields:
{{
  "sentiment": "anxious",
  "engagement_score": 0.4,
  "anxiety_score": 0.8,
  "cognitive_distortion": "catastrophizing",
  "therapist_reply": "I hear you and I want you to know your feelings are valid..."
}}"""

    completion = get_client().chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(completion.choices[0].message.content)


def run_quest_agent(therapist_state: dict) -> dict:
    prompt = f"""You are a Quest Generator Agent. The user's therapist assessment:
- Sentiment: {therapist_state.get('sentiment')}
- Anxiety score: {therapist_state.get('anxiety_score')}
- Distortion: {therapist_state.get('cognitive_distortion')}

Create a gamified CBT therapeutic quest. Return ONLY valid JSON:
{{
  "quest_title": "The Calm Warrior Challenge",
  "quest_lore": "You face the storm of anxiety. Each step forward is a victory...",
  "steps": [
    {{"description": "Take 5 deep breaths using the 4-7-8 technique", "xp_reward": 30}},
    {{"description": "Write down 3 things you can control right now", "xp_reward": 50}},
    {{"description": "Send one supportive message to yourself", "xp_reward": 70}}
  ],
  "total_xp": 150
}}"""

    completion = get_client().chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(completion.choices[0].message.content)


def run_supervisor_agent(therapist_res: dict, quest_res: dict) -> dict:
    prompt = f"""You are the Supervisor Agent. Review this therapy output for safety.

Therapist reply: {therapist_res.get('therapist_reply', '')}
Quest title: {quest_res.get('quest_title', '')}

Is this safe, non-harmful, and free of dangerous medical advice?

Return ONLY valid JSON:
{{
  "is_safe": true,
  "reason": "Content is appropriate and supportive, no harmful advice detected."
}}"""

    completion = get_client().chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    result = json.loads(completion.choices[0].message.content)
    result["final_payload"] = {
        "sentiment": therapist_res.get("sentiment"),
        "anxiety_score": therapist_res.get("anxiety_score"),
        "engagement_score": therapist_res.get("engagement_score"),
        "quest_title": quest_res.get("quest_title"),
        "total_xp": quest_res.get("total_xp")
    }
    return result
