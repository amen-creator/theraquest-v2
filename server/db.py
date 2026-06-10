import os
import logging
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client
from schemas import TherapistOutput, QuestOutput

logger = logging.getLogger("amaterasu.db")

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
else:
    logger.warning("Supabase credentials missing. DB persistence disabled.")


async def persist_session(user_id: str, t: TherapistOutput, q: QuestOutput):
    """Persist the interaction state to Supabase asynchronously."""
    if not supabase:
        return
        
    payload = {
        "user_id": user_id,
        "sentiment": t.sentiment,
        "anxiety_score": t.anxiety_score,
        "engagement_score": t.engagement_score,
        "quest_title": q.quest_title,
        "total_xp": q.total_xp
    }
    try:
        await asyncio.to_thread(supabase.table("interactions").insert(payload).execute)
        logger.info(f"[{user_id}] Session persisted to Supabase successfully.")
    except Exception as e:
        logger.error(f"[{user_id}] Supabase persist error: {e}")

async def get_user_history(user_id: str):
    """Retrieve the interaction history for a user."""
    if not supabase:
        return []
        
    try:
        # Wrap Supabase sync call in a lambda to pass to to_thread
        def fetch_data():
            return supabase.table("interactions").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
        
        response = await asyncio.to_thread(fetch_data)
        return response.data
    except Exception as e:
        logger.error(f"[{user_id}] Supabase read error: {e}")
        return []
