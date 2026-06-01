def build_roadmap(snapshot, weaknesses):
    weak_ids = {w["topic_id"] for w in weaknesses[:2]}
    nodes = []
    for t in snapshot.topics:
        status = "focus" if t.topic_id in weak_ids else ("mastered" if t.mastery_score >= 85 else "in-progress")
        nodes.append({"topic_id": t.topic_id, "topic_name": t.topic_name, "status": status})
    return {"subject_id": snapshot.subject_id, "nodes": nodes}
