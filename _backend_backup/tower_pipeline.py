import os
import asyncio
import logging
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from groq import AsyncGroq

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

logging.basicConfig(level=logging.INFO, format="[TOWER PIPELINE] %(message)s")
logger = logging.getLogger("amaterasu.tower")

# Supabase Initialization
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if url and key:
    supabase: Client = create_client(url, key)
else:
    supabase = None
    logger.warning("Supabase credentials missing. Tower pipeline will use simulated lakehouse data.")

def get_ai_client():
    return AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

async def extract_data_to_lakehouse():
    """
    Extracts transactional data from Supabase into our data lake format
    for analytical processing.
    """
    logger.info("Extracting data from transactional DB to Lakehouse...")
    if supabase:
        response = supabase.table("interactions").select("*").execute()
        data = response.data
    else:
        # Simulated fallback data for demonstration
        data = [
            {"anxiety_score": 0.8, "engagement_score": 0.9, "sentiment": "Overwhelmed by work", "quest_title": "The Breath of Calm"},
            {"anxiety_score": 0.6, "engagement_score": 0.7, "sentiment": "Stressed about family", "quest_title": "Thought Detective"},
            {"anxiety_score": 0.9, "engagement_score": 0.95, "sentiment": "Panic attack symptoms", "quest_title": "Grounding Ritual"},
            {"anxiety_score": 0.3, "engagement_score": 0.5, "sentiment": "Feeling a bit lonely", "quest_title": "Gratitude Spark"}
        ]
    logger.info(f"Extracted {len(data)} records.")
    return data

def transform_features(data):
    """
    Transforms raw data into aggregated features for the AI to interpret.
    """
    logger.info("Transforming raw data into analytical features (dbt/pandas simulation)...")
    if not data:
        return {"average_anxiety": 0, "total_sessions": 0, "common_sentiments": []}
    
    avg_anxiety = sum(row.get("anxiety_score", 0) for row in data) / len(data)
    avg_engagement = sum(row.get("engagement_score", 0) for row in data) / len(data)
    sentiments = [row.get("sentiment", "") for row in data]
    
    features = {
        "total_sessions": len(data),
        "average_anxiety_index": round(avg_anxiety * 100, 2),
        "average_engagement_index": round(avg_engagement * 100, 2),
        "raw_sentiments_sample": sentiments[:10]
    }
    logger.info(f"Generated features: {features}")
    return features

async def interpret_with_ai_agent(features):
    """
    Passes the aggregated Lakehouse features to an AI Agent for clinical interpretation.
    """
    logger.info("Launching AI Agent for advanced data interpretation...")
    client = get_ai_client()
    
    prompt = f"""You are the Global Clinical Director AI for TheraQuest.
Review the following aggregated patient data features extracted from our data lake:

{features}

Write a brief 3-paragraph executive summary reporting on the global mental health trends of our users. 
Include actionable recommendations on what CBT quests we should design next based on the predominant sentiments and average anxiety index.
Format the output professionally."""

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=800
    )
    
    report = response.choices[0].message.content
    return report

async def run_tower_workflow():
    logger.info("=== STARTING TOWER DATA-TO-AI PIPELINE ===")
    
    # 1. Extract
    raw_data = await extract_data_to_lakehouse()
    
    # 2. Transform
    features = transform_features(raw_data)
    
    # 3. AI Interpretation
    insights_report = await interpret_with_ai_agent(features)
    
    # 4. Load/Publish
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_filename = f"global_insights_report_{timestamp}.md"
    
    with open(report_filename, "w", encoding="utf-8") as f:
        f.write("# Tower Pipeline: Data-to-AI Insights\n\n")
        f.write(insights_report)
        
    logger.info(f"Pipeline complete! Report saved to {report_filename}")
    logger.info("=== PIPELINE FINISHED ===")

if __name__ == "__main__":
    asyncio.run(run_tower_workflow())
