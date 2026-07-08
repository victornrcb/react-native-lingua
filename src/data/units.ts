// ─────────────────────────────────────────────────────────────────────────────
// data/units.ts
// Hardcoded unit data for each supported language.
// Each unit groups related lessons and is displayed as a section on the
// Learn tab. Add a new object here to extend the course.
// ─────────────────────────────────────────────────────────────────────────────

import { Unit } from "@/types/learning";

// ──────────────────── Spanish Units ───────────────────────────────────────────

export const spanishUnits: Unit[] = [
  {
    id: "es-unit-1",
    languageCode: "es",
    title: "Greetings & Introductions",
    description: "Say hello, introduce yourself, and meet new people in Spanish.",
    order: 1,
    color: "#FF6B35",
    icon: "👋",
    lessonIds: [
      "es-1-1-vocab",
      "es-1-2-phrases",
      "es-1-3-audio",
      "es-1-4-ai-teacher",
    ],
  },
  {
    id: "es-unit-2",
    languageCode: "es",
    title: "Numbers & Time",
    description: "Count, tell the time, and talk about dates.",
    order: 2,
    color: "#4ECDC4",
    icon: "🔢",
    lessonIds: [
      "es-2-1-vocab",
      "es-2-2-grammar",
      "es-2-3-audio",
    ],
  },
];

// ──────────────────── French Units ────────────────────────────────────────────

export const frenchUnits: Unit[] = [
  {
    id: "fr-unit-1",
    languageCode: "fr",
    title: "Greetings & Introductions",
    description: "Bonjour! Learn to greet people and introduce yourself in French.",
    order: 1,
    color: "#6C63FF",
    icon: "🗼",
    lessonIds: [
      "fr-1-1-vocab",
      "fr-1-2-phrases",
      "fr-1-3-ai-teacher",
    ],
  },
];

// ──────────────────── Japanese Units ──────────────────────────────────────────

export const japaneseUnits: Unit[] = [
  {
    id: "ja-unit-1",
    languageCode: "ja",
    title: "Hiragana Basics",
    description: "Learn your first Japanese characters and common greetings.",
    order: 1,
    color: "#FF4D6D",
    icon: "🌸",
    lessonIds: [
      "ja-1-1-vocab",
      "ja-1-2-phrases",
      "ja-1-3-audio",
    ],
  },
];

// ──────────────────── Combined export ─────────────────────────────────────────

/**
 * All units indexed by language code.
 * Usage: `unitsByLanguage["es"]` → Spanish units array.
 */
export const unitsByLanguage: Record<string, Unit[]> = {
  es: spanishUnits,
  fr: frenchUnits,
  ja: japaneseUnits,
};

/** Flat list of all units across all languages. */
export const allUnits: Unit[] = [
  ...spanishUnits,
  ...frenchUnits,
  ...japaneseUnits,
];

/**
 * Look up a single unit by ID.
 * Returns undefined if the unit is not found.
 */
export function getUnitById(id: string): Unit | undefined {
  return allUnits.find((unit) => unit.id === id);
}
