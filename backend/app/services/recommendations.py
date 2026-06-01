def build_recommendations(weaknesses, difficulty_predictions):
    recs = []
    for w in weaknesses[:2]:
        recs.append({"type": "revision", "title": f"Revise {w['topic_name']}", "reason": f"Weakness score {w['weakness_score']}"})
    for topic_id, p in list(difficulty_predictions.items())[:2]:
        if p > 0.65:
            recs.append({"type": "support", "title": f"Mentor session for {topic_id}", "reason": f"Predicted difficulty {int(p*100)}%"})
    return recs
