def build_analytics(snapshot, weaknesses):
    avg = 0 if not snapshot.topics else round(sum(t.mastery_score for t in snapshot.topics) / len(snapshot.topics), 2)
    high_risk = sum(1 for w in weaknesses if w["weakness_score"] >= 35)
    return {"average_mastery": avg, "topics_count": len(snapshot.topics), "high_risk_topics": high_risk}
