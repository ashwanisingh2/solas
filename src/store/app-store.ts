import { create } from "zustand";

type AppState = {
  userId: string;
  streak: number;
  currentSubjectId?: string;
  setUserId: (userId: string) => void;
  setSubject: (subjectId: string) => void;
  incrementStreak: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  userId: "demo-user",
  streak: 0,
  setUserId: (userId) => set({ userId }),
  setSubject: (currentSubjectId) => set({ currentSubjectId }),
  incrementStreak: () => set((s) => ({ streak: s.streak + 1 })),
}));
