// ─────────────────────────────────────────────────────────────────────────────
// store/languageStore.ts
// Zustand store for the user's selected learning language.
// Persisted to AsyncStorage so the selection survives app restarts.
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { Language } from "@/types/learning";

// ── Storage key ───────────────────────────────────────────────────────────────
const STORAGE_KEY = "lingua:selected-language";

// ── Store shape ───────────────────────────────────────────────────────────────
interface LanguageState {
  /** The language the user has chosen to learn. Null until they pick one. */
  selectedLanguage: Language | null;
  /** True while the initial load from AsyncStorage is in progress. */
  isHydrating: boolean;

  // Actions
  setLanguage: (language: Language) => Promise<void>;
  clearLanguage: () => Promise<void>;
  hydrate: () => Promise<void>;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useLanguageStore = create<LanguageState>((set) => ({
  selectedLanguage: null,
  isHydrating: true,

  /**
   * Persist and update the selected language.
   */
  setLanguage: async (language: Language) => {
    try {
      const jsonValue = JSON.stringify(language);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error("[languageStore] Failed to persist language:", e);
    }
    set({ selectedLanguage: language });
  },

  /**
   * Remove the selected language — used during testing / sign-out.
   */
  clearLanguage: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("[languageStore] Failed to clear language:", e);
    }
    set({ selectedLanguage: null });
  },

  /**
   * Load the previously stored language from AsyncStorage.
   * Call this once on app start (inside the root layout).
   */
  hydrate: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const language: Language | null =
        jsonValue != null ? JSON.parse(jsonValue) : null;
      set({ selectedLanguage: language, isHydrating: false });
    } catch (e) {
      console.error("[languageStore] Failed to hydrate language:", e);
      set({ isHydrating: false });
    }
  },
}));
