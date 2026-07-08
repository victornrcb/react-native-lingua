// ─────────────────────────────────────────────────────────────────────────────
// data/languages.ts
// Master list of all languages the app supports.
// Add a new Language object here and a matching LanguageCode in types/learning.ts
// to extend the course catalogue.
// ─────────────────────────────────────────────────────────────────────────────

import { Language, LanguageCode } from "@/types/learning";

export const languages: Language[] = [
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "https://flagcdn.com/w320/es.png",
    tagline: "Spoken by 500 million people worldwide.",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "https://flagcdn.com/w320/fr.png",
    tagline: "The language of love, art, and diplomacy.",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "https://flagcdn.com/w320/de.png",
    tagline: "Europe's most spoken native language.",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "https://flagcdn.com/w320/jp.png",
    tagline: "A unique blend of three writing systems.",
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "https://flagcdn.com/w320/it.png",
    tagline: "The language of pasta, art, and opera.",
  },
];

/**
 * Look up a language by its code.
 * Returns undefined if the code is not found.
 */
export function getLanguageByCode(code: LanguageCode): Language | undefined {
  return languages.find((lang) => lang.code === code);
}

/**
 * Languages that have lesson content available in this build.
 * Update this list when new course content is added.
 */
export const availableLanguageCodes: LanguageCode[] = ["es", "fr", "ja"];

/**
 * All languages that currently have course content.
 */
export const availableLanguages: Language[] = languages.filter((lang) =>
  (availableLanguageCodes as string[]).includes(lang.code),
);
