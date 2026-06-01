def predict_difficulty(snapshot):
    predictions = {}
    for t in snapshot.topics:
        base = 0.5 + (0.3 if t.mastery_score < 70 else -0.2)
        attempts_factor = 0.1 if t.attempts < 2 else -0.05
        predictions[t.topic_id] = round(min(1.0, max(0.0, base + attempts_factor)), 2)
    return predictions
