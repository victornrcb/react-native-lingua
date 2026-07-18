// ─────────────────────────────────────────────────────────────────────────────
// data/units.ts
// Hardcoded unit data for each supported language.
// Each unit groups related lessons and is displayed as a section on the
// Learn tab. Add a new object here to extend the course.
// ─────────────────────────────────────────────────────────────────────────────

import { Unit, LanguageCode } from "@/types/learning";

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
    coverImage: "https://picsum.photos/seed/es-greet/800/400",
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
    coverImage: "https://picsum.photos/seed/es-numbers/800/400",
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
    coverImage: "https://picsum.photos/seed/fr-greet/800/400",
    lessonIds: [
      "fr-1-1-vocab",
      "fr-1-2-phrases",
      "fr-1-3-ai-teacher",
    ],
  },
  {
    id: "fr-unit-2",
    languageCode: "fr",
    title: "Numbers & Time",
    description: "Count from 1 to 10 and tell the time like a true Parisian.",
    order: 2,
    color: "#4ECDC4",
    icon: "🔢",
    coverImage: "https://picsum.photos/seed/fr-numbers/800/400",
    lessonIds: [
      "fr-2-1-vocab",
      "fr-2-2-grammar",
      "fr-2-3-audio",
    ],
  },
  {
    id: "fr-unit-3",
    languageCode: "fr",
    title: "At the Café",
    description: "Order coffee, pastries and ask for the bill at a French café.",
    order: 3,
    color: "#FF6B35",
    icon: "☕",
    coverImage: "https://picsum.photos/seed/fr-cafe/800/400",
    lessonIds: [
      "fr-3-1-vocab",
      "fr-3-2-conversation",
      "fr-3-3-ai-teacher",
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
    coverImage: "https://picsum.photos/seed/ja-hiragana/800/400",
    lessonIds: [
      "ja-1-1-vocab",
      "ja-1-2-phrases",
      "ja-1-3-audio",
    ],
  },
  {
    id: "ja-unit-2",
    languageCode: "ja",
    title: "Numbers & Counting",
    description: "Count in Japanese and tell the time like a local.",
    order: 2,
    color: "#4ECDC4",
    icon: "🔢",
    coverImage: "https://picsum.photos/seed/ja-numbers/800/400",
    lessonIds: [
      "ja-2-1-vocab",
      "ja-2-2-grammar",
      "ja-2-3-audio",
      "ja-2-4-ai-teacher",
    ],
  },
];

// ──────────────────── Combined export ─────────────────────────────────────────

/**
 * All units indexed by language code.
 * Usage: `unitsByLanguage["es"]` → Spanish units array.
 */
export const unitsByLanguage: Partial<Record<LanguageCode, Unit[]>> = {
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
