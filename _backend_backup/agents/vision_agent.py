import os
import logging
from groq import AsyncGroq

logger = logging.getLogger("amaterasu.vision")

def get_llm_client():
    api_key = os.environ.get("GROQ_API_KEY")
    return AsyncGroq(api_key=api_key)

async def run_vision_agent(image_data_url: str) -> str:
    """
    Analyzes a base64 encoded image frame from the user's webcam
    to detect facial expressions and micro-expressions.
    Returns a brief clinical observation of their emotional state.
    """
    try:
        logger.info("Agent 5 (Vision) analyzing biometric frame...")
        client = get_llm_client()
        
        prompt = "You are Agent 5: Biometric Vision Analyzer for a CBT Therapy pipeline. Look at the user's face in the image and describe their core emotional state (e.g., tense, relaxed, sad, focused, distracted). Keep it under 15 words."
        
        # Make sure the image_data_url is properly formatted. The UI should send it as 'data:image/jpeg;base64,...'
        res = await client.chat.completions.create(
            model="llama-3.2-11b-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_data_url,
                            },
                        },
                    ],
                }
            ],
            max_tokens=50,
            temperature=0.2
        )
        expression = res.choices[0].message.content.strip()
        logger.info(f"Agent 5 detected: {expression}")
        return expression
    except Exception as e:
        logger.error(f"Vision Agent failed: {e}")
        return "Facial expression unreadable."
