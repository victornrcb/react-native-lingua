// ─────────────────────────────────────────────────────────────────────────────
// store/useProgressStore.ts
// Zustand store for XP, streak, daily goal, and completed lessons.
// Persisted to AsyncStorage so progress survives app restarts.
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

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
  addXP: (amount: number) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  todayXP: 15,
  dailyGoalXP: 20,
  streak: 12,
  completedLessonIds: ["es-1-1-vocab"],

  addXP: async (amount) => {
    const next = get().todayXP + amount;
    set({ todayXP: next });
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...get(), todayXP: next }),
    );
  },

  completeLesson: async (lessonId) => {
    const ids = [...get().completedLessonIds];
    if (!ids.includes(lessonId)) {
      ids.push(lessonId);
      set({ completedLessonIds: ids });
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...get(), completedLessonIds: ids }),
      );
    }
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Partial<ProgressState>;
        set({
          todayXP: stored.todayXP ?? 15,
          dailyGoalXP: stored.dailyGoalXP ?? 20,
          streak: stored.streak ?? 12,
          completedLessonIds: stored.completedLessonIds ?? ["es-1-1-vocab"],
        });
      }
    } catch (e) {
      console.error("[progressStore] Failed to hydrate:", e);
    }
  },
}));
