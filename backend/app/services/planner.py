def build_daily_plan(snapshot, revision_schedule):
    budget = snapshot.study_minutes_per_day
    blocks = [25, 20, 15]
    names = [r["topic_name"] for r in revision_schedule[:3]] or ["Revision", "Practice", "Reflection"]
    plan = []
    for i, d in enumerate(blocks):
        if budget <= 0:
            break
        duration = min(d, budget)
        plan.append({"block": f"Block {i+1}", "topic_name": names[i] if i < len(names) else "Practice", "duration_min": duration})
        budget -= duration
    return plan
