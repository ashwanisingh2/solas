def build_revision_schedule(weaknesses):
    out = []
    for i, w in enumerate(weaknesses[:6]):
        out.append({
            "topic_id": w["topic_id"],
            "topic_name": w["topic_name"],
            "due_in_days": 1 if i < 2 else (3 if i < 4 else 6),
            "priority": "high" if w["weakness_score"] >= 35 else "medium",
        })
    return out
