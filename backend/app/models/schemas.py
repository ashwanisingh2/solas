from pydantic import BaseModel, Field
from typing import List, Dict

class TopicPerformance(BaseModel):
    topic_id: str
    topic_name: str
    attempts: int = 0
    mastery_score: int = 0

class StudentSnapshot(BaseModel):
    user_id: str
    subject_id: str
    topics: List[TopicPerformance] = Field(default_factory=list)
    study_minutes_per_day: int = 60

class WeaknessItem(BaseModel):
    topic_id: str
    topic_name: str
    weakness_score: float

class RevisionTask(BaseModel):
    topic_id: str
    topic_name: str
    due_in_days: int
    priority: str

class DailyPlanItem(BaseModel):
    block: str
    topic_name: str
    duration_min: int

class NotificationItem(BaseModel):
    type: str
    message: str

class RecommendationItem(BaseModel):
    type: str
    title: str
    reason: str

class IntelligenceBundle(BaseModel):
    weaknesses: List[WeaknessItem]
    revision_schedule: List[RevisionTask]
    daily_plan: List[DailyPlanItem]
    notifications: List[NotificationItem]
    analytics: Dict
    roadmap: Dict
    difficulty_predictions: Dict[str, float]
    recommendations: List[RecommendationItem]
