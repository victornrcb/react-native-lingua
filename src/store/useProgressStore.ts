// ─────────────────────────────────────────────────────────────────────────────
// store/useProgressStore.ts
// Zustand store for XP, streak, daily goal, and completed lessons.
// Persisted to AsyncStorage via Zustand's persist middleware — no manual
// setItem calls, no race conditions between concurrent state updates.
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const STORAGE_KEY = "lingua:progress";

interface ProgressState {
  /** XP earned today */
  todayXP: number;
  /** Daily XP goal */
  dailyGoalXP: number;
  /** Current streak in days */
  streak: number;
  /** IDs of completed lessons */
  completedLessonIds: string[];

  // Actions
  addXP: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      todayXP: 15,
      dailyGoalXP: 20,
      streak: 12,
      completedLessonIds: ["es-1-1-vocab"],

      addXP: (amount) => {
        set((state) => ({ todayXP: state.todayXP + amount }));
      },

      completeLesson: (lessonId) => {
        if (!get().completedLessonIds.includes(lessonId)) {
          set((state) => ({
            completedLessonIds: [...state.completedLessonIds, lessonId],
          }));
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the data fields, not the action functions
      partialize: (state) => ({
        todayXP: state.todayXP,
        dailyGoalXP: state.dailyGoalXP,
        streak: state.streak,
        completedLessonIds: state.completedLessonIds,
      }),
    },
  ),
);
