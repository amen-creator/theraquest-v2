import os
import logging
from groq import AsyncGroq
from backend.db import get_user_history

logger = logging.getLogger("amaterasu.memory")

async def run_memory_agent(user_id: str, current_message: str) -> str:
    """
    Agent 6: Deep Memory RAG Agent.
    Retrieves the user's past sessions from Supabase and synthesizes
    a contextual memory summary to inject into the Therapist's prompt.
    """
    try:
        history = await get_user_history(user_id)
        if not history:
            return None

        # Build a condensed history for the LLM
        history_text = ""
        for i, session in enumerate(history[-5:]):  # Last 5 sessions
            history_text += f"Session {i+1}: {session}\n"

        logger.info(f"Memory Agent has {len(history)} past sessions for {user_id}")

        client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
        prompt = f"""You are Agent 6: Deep Memory Analyst. 
Review this user's therapy history and extract 1-2 sentences of the most clinically relevant context 
that a therapist should know before responding to today's message.

User's current message: "{current_message}"

Past sessions:
{history_text}

Return ONLY the memory context string (no JSON, no extra text). 
Focus on recurring patterns, unresolved concerns, or emotional themes. 
If nothing is strongly relevant, return an empty string."""

        res = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.2
        )
        memory_ctx = res.choices[0].message.content.strip()
        logger.info(f"Memory Agent synthesized: {memory_ctx[:80]}...")
        return memory_ctx if memory_ctx else None

    except Exception as e:
        logger.error(f"Memory Agent failed: {e}")
        return None
