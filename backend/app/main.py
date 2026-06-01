from fastapi import FastAPI
from app.models.schemas import StudentSnapshot, IntelligenceBundle
from app.services.redis_client import redis_client
from app.services.weakness import detect_weaknesses
from app.services.revision import build_revision_schedule
from app.services.planner import build_daily_plan
from app.services.notifications import build_notifications
from app.services.analytics import build_analytics
from app.services.roadmap import build_roadmap
from app.services.difficulty import predict_difficulty
from app.services.recommendations import build_recommendations

app = FastAPI(title="GuruAI Intelligence API")

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/intelligence", response_model=IntelligenceBundle)
def intelligence(snapshot: StudentSnapshot, streak: int = 0):
    cache_key = f"intel:{snapshot.user_id}:{snapshot.subject_id}:{len(snapshot.topics)}:{streak}:{snapshot.study_minutes_per_day}"
    cached = redis_client.get(cache_key)
    if cached:
        import json
        return json.loads(cached)

    weaknesses = detect_weaknesses(snapshot)
    revision = build_revision_schedule(weaknesses)
    plan = build_daily_plan(snapshot, revision)
    notifications = build_notifications(streak, revision)
    analytics = build_analytics(snapshot, weaknesses)
    roadmap = build_roadmap(snapshot, weaknesses)
    difficulty = predict_difficulty(snapshot)
    recommendations = build_recommendations(weaknesses, difficulty)

    bundle = {
        "weaknesses": weaknesses,
        "revision_schedule": revision,
        "daily_plan": plan,
        "notifications": notifications,
        "analytics": analytics,
        "roadmap": roadmap,
        "difficulty_predictions": difficulty,
        "recommendations": recommendations,
    }

    import json
    redis_client.setex(cache_key, 900, json.dumps(bundle))
    return bundle
