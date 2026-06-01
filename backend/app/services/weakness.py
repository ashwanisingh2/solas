from app.models.schemas import StudentSnapshot

def detect_weaknesses(snapshot: StudentSnapshot):
    scored = []
    for t in snapshot.topics:
        gap = max(0, 100 - t.mastery_score)
        confidence_penalty = 15 if t.attempts < 2 else 0
        weakness = min(100, gap + confidence_penalty)
        scored.append({"topic_id": t.topic_id, "topic_name": t.topic_name, "weakness_score": round(weakness, 2)})
    return sorted(scored, key=lambda x: x["weakness_score"], reverse=True)
