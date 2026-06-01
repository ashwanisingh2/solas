def build_notifications(streak: int, revision_schedule):
    notes = []
    if streak > 0:
        notes.append({"type": "streak", "message": f"{streak}-day streak active. Study today to keep it."})
    if revision_schedule:
        notes.append({"type": "revision", "message": f"{revision_schedule[0]['topic_name']} due for revision in {revision_schedule[0]['due_in_days']} day(s)."})
    notes.append({"type": "mastery", "message": "Score 85%+ in mastery test to unlock next topic."})
    return notes
