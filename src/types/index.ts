export type Subject = { id: string; name: string; description: string; icon: string; order_index: number };
export type Topic = { id: string; subject_id: string; name: string; description: string; order_index: number; difficulty: number };
export type UserProgress = { user_id: string; topic_id: string; completed: boolean; mastery_score: number; attempts: number; updated_at: string };
