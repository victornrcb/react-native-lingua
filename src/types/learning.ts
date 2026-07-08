// ─────────────────────────────────────────────────────────────────────────────
// types/learning.ts
// Core types for the Lingua learning content system.
// ─────────────────────────────────────────────────────────────────────────────

// ──────────────────── Language ────────────────────────────────────────────────

/** Supported learning languages. Add new codes here as the app grows. */
export type LanguageCode = "es" | "fr" | "de" | "ja" | "it";

export interface Language {
  /** BCP-47 language code, e.g. "es" */
  code: LanguageCode;
  /** Display name in English */
  name: string;
  /** Native name, e.g. "Español" */
  nativeName: string;
  /** Emoji flag for quick identification */
  flag: string;
  /** Short motivational tagline shown on the language-picker card */
  tagline: string;
}

// ──────────────────── Vocabulary ──────────────────────────────────────────────

export interface VocabItem {
  /** Target-language word / phrase */
  word: string;
  /** English translation */
  translation: string;
  /** Romanisation for scripts that are hard to read (e.g. Japanese) */
  romanization?: string;
  /** Part of speech: noun, verb, adjective, adverb, phrase */
  partOfSpeech: "noun" | "verb" | "adjective" | "adverb" | "phrase";
  /** Example sentence using the word in the target language */
  exampleSentence?: string;
  /** Translation of the example sentence */
  exampleTranslation?: string;
}

// ──────────────────── Phrases ─────────────────────────────────────────────────

export interface Phrase {
  /** Target-language phrase */
  phrase: string;
  /** English translation */
  translation: string;
  /** Phonetic pronunciation hint */
  pronunciation?: string;
  /** Context / usage note */
  context?: string;
}

// ──────────────────── Activities ──────────────────────────────────────────────

/** Every activity variant the lesson system supports. */
export type ActivityType =
  | "multiple_choice"    // Pick the correct translation
  | "fill_in_blank"      // Complete the sentence
  | "match_pairs"        // Match word to translation
  | "listen_and_repeat"  // Audio pronunciation drill
  | "speak_it"           // User speaks, AI evaluates
  | "arrange_words"      // Drag words into correct order
  | "true_or_false";     // Comprehension check

export interface ActivityOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Activity {
  id: string;
  type: ActivityType;
  /** Instruction text shown above the activity */
  prompt: string;
  /** For multiple_choice / true_or_false */
  options?: ActivityOption[];
  /** For fill_in_blank / arrange_words */
  sentence?: string;
  /** The blank placeholder token used in fill_in_blank sentences */
  blankToken?: string;
  /** Correct answer text (used for fill_in_blank, arrange_words) */
  correctAnswer?: string;
  /** Words available to arrange (for arrange_words) */
  wordBank?: string[];
  /** Optional hint the user can reveal */
  hint?: string;
  /** XP awarded on first correct attempt */
  xpReward: number;
}

// ──────────────────── Lesson Goals ────────────────────────────────────────────

export interface LessonGoal {
  /** Short human-readable goal description */
  description: string;
  /** Skill category this goal develops */
  skill: "vocabulary" | "grammar" | "pronunciation" | "listening" | "speaking" | "reading";
}

// ──────────────────── AI Teacher Prompt ───────────────────────────────────────

/**
 * Prompt configuration for the Vision Agent audio/video AI teacher.
 * These values are sent to the backend which builds the full system prompt.
 */
export interface AITeacherPrompt {
  /** High-level persona the AI teacher should adopt */
  teacherPersona: string;
  /** Lesson topic in one sentence */
  lessonTopic: string;
  /** Target language being taught */
  targetLanguage: string;
  /** Student's native language (currently English-first) */
  nativeLanguage: string;
  /** Difficulty guidance for the AI */
  difficulty: "beginner" | "intermediate" | "advanced";
  /** Vocabulary the AI should focus on in this lesson */
  keyVocabulary: string[];
  /** Grammar structure to introduce / reinforce */
  grammarFocus?: string;
  /** Opening lines / icebreaker the AI teacher should say */
  openingScript: string;
  /** Teaching tips specific to this lesson */
  teachingNotes: string;
}

// ──────────────────── Lesson ──────────────────────────────────────────────────

export type LessonType =
  | "vocabulary"   // Word learning
  | "grammar"      // Grammar explanation + drill
  | "conversation" // Guided dialogue
  | "audio"        // Listen & repeat
  | "ai_teacher";  // Live Vision Agent session

export interface Lesson {
  id: string;
  /** Parent unit this lesson belongs to */
  unitId: string;
  /** Display title */
  title: string;
  /** Short description (1-2 sentences) */
  description: string;
  /** Lesson type drives which player/UI is shown */
  type: LessonType;
  /** 1-based order within the unit */
  order: number;
  /** Estimated duration in minutes */
  durationMinutes: number;
  /** Learning goals for this lesson */
  goals: LessonGoal[];
  /** Vocabulary introduced or reinforced */
  vocabulary: VocabItem[];
  /** Key phrases covered */
  phrases: Phrase[];
  /** Interactive activity sequence */
  activities: Activity[];
  /** Total XP a student can earn */
  totalXP: number;
  /** AI teacher configuration (required for ai_teacher type) */
  aiTeacherPrompt?: AITeacherPrompt;
  /** Whether the lesson is locked until previous lessons are complete */
  isLocked: boolean;
  /** Optional icon name (expo-symbols compatible) */
  iconName?: string;
}

// ──────────────────── Unit ────────────────────────────────────────────────────

export interface Unit {
  id: string;
  /** Language this unit belongs to */
  languageCode: LanguageCode;
  /** Display title, e.g. "Greetings & Introductions" */
  title: string;
  /** Short description of what the unit covers */
  description: string;
  /** 1-based order within the course */
  order: number;
  /** Color accent for unit card UI (hex) */
  color: string;
  /** Emoji or short icon identifier */
  icon: string;
  /** IDs of lessons in this unit (ordered) */
  lessonIds: string[];
}

// ──────────────────── Course (convenience aggregate) ──────────────────────────

export interface Course {
  language: Language;
  units: Unit[];
  lessons: Lesson[];
}
