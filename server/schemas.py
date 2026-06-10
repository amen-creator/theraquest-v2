from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# --- Input Schemas ---
class UserInteraction(BaseModel):
    user_id: str = Field(description="Unique identifier for the user.")
    message: str = Field(description="The natural language input from the user.")
    image_data: Optional[str] = Field(default=None, description="Base64 encoded webcam frame for biometric analysis.")

# --- Agent 1: Therapist Schemas ---
class TherapistOutput(BaseModel):
    sentiment: str = Field(description="Primary emotional state (e.g., anxious, motivated, neutral).")
    engagement_score: float = Field(description="Score from 0.0 to 1.0 indicating user's engagement.")
    anxiety_score: float = Field(description="Score from 0.0 to 1.0 indicating user's anxiety level.")
    cognitive_distortion: Optional[str] = Field(description="Detected cognitive distortion, if any.")
    therapist_reply: str = Field(description="Empathetic, CBT-aligned response to the user.")

# --- Agent 2: Quest Generator Schemas ---
class QuestStep(BaseModel):
    description: str = Field(description="Actionable step description.")
    xp_reward: int = Field(description="XP points awarded for this step.")

class QuestOutput(BaseModel):
    quest_title: str = Field(description="Engaging title for the gamified quest.")
    quest_lore: str = Field(description="Narrative lore framing the therapeutic exercise.")
    steps: List[QuestStep] = Field(description="List of actionable steps.")
    total_xp: int = Field(description="Total XP upon full quest completion.")

# --- Agent 3: Supervisor Schemas ---
class SupervisorOutput(BaseModel):
    is_safe: bool = Field(description="True if the entire response chain is safe and medically appropriate.")
    reason: str = Field(description="Reasoning for the safety evaluation.")
    final_payload: Dict[str, Any] = Field(description="Aggregated data ready for Supabase persistence.")

# --- Agent 4: Nimble Web Agent Schemas ---
class NimbleSource(BaseModel):
    title: str = Field(description="Title of the extracted web page or resource.")
    url: str = Field(description="URL of the source.")
    snippet: str = Field(description="Brief extracted clinical summary or description.")

# --- Final Response Schema ---
class VectorMetrics(BaseModel):
    anxiety: float
    engagement: float

class InteractionResponse(BaseModel):
    therapist_reply: str
    quest: QuestOutput
    vector_metrics: VectorMetrics
    nimble_sources: List[NimbleSource] = []
