// ─────────────────────────────────────────────────────────────────────────────
// data/lessons.ts
// Hardcoded lesson content for the Lingua learning system.
//
// Naming convention for IDs:
//   <languageCode>-<unitNumber>-<lessonNumber>-<type>
//   e.g. "es-1-1-vocab"
//
// To add a new lesson:
//   1. Create a Lesson object below in the correct language section.
//   2. Add its id to the corresponding unit's `lessonIds` array in units.ts.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Activity,
  AITeacherPrompt,
  Lesson,
  LessonGoal,
  Phrase,
  VocabItem,
} from "@/types/learning";

// ═════════════════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═════════════════════════════════════════════════════════════════════════════

function calcTotalXP(activities: Activity[]): number {
  return activities.reduce((sum, a) => sum + a.xpReward, 0);
}

// ═════════════════════════════════════════════════════════════════════════════
// SPANISH — Unit 1: Greetings & Introductions
// ═════════════════════════════════════════════════════════════════════════════

// ── Vocabulary ────────────────────────────────────────────────────────────────

const es1Vocab: VocabItem[] = [
  {
    word: "hola",
    translation: "hello",
    partOfSpeech: "phrase",
    exampleSentence: "¡Hola! ¿Cómo estás?",
    exampleTranslation: "Hello! How are you?",
  },
  {
    word: "adiós",
    translation: "goodbye",
    partOfSpeech: "phrase",
    exampleSentence: "Adiós, hasta mañana.",
    exampleTranslation: "Goodbye, see you tomorrow.",
  },
  {
    word: "gracias",
    translation: "thank you",
    partOfSpeech: "phrase",
    exampleSentence: "Muchas gracias por tu ayuda.",
    exampleTranslation: "Thank you very much for your help.",
  },
  {
    word: "por favor",
    translation: "please",
    partOfSpeech: "phrase",
    exampleSentence: "Un café, por favor.",
    exampleTranslation: "A coffee, please.",
  },
  {
    word: "me llamo",
    translation: "my name is",
    partOfSpeech: "phrase",
    exampleSentence: "Me llamo Ana.",
    exampleTranslation: "My name is Ana.",
  },
  {
    word: "mucho gusto",
    translation: "nice to meet you",
    partOfSpeech: "phrase",
    exampleSentence: "Mucho gusto, soy Carlos.",
    exampleTranslation: "Nice to meet you, I'm Carlos.",
  },
];

// ── Phrases ───────────────────────────────────────────────────────────────────

const es1Phrases: Phrase[] = [
  {
    phrase: "¿Cómo te llamas?",
    translation: "What is your name?",
    pronunciation: "KOH-moh teh YAH-mahs",
    context: "Informal — use with friends or people your age.",
  },
  {
    phrase: "¿Cómo estás?",
    translation: "How are you?",
    pronunciation: "KOH-moh eh-STAHS",
    context: "Informal greeting — used every day.",
  },
  {
    phrase: "Estoy bien, gracias.",
    translation: "I'm fine, thank you.",
    pronunciation: "eh-STOY byehn GRAH-syas",
    context: "Standard polite reply to ¿Cómo estás?",
  },
  {
    phrase: "¿De dónde eres?",
    translation: "Where are you from?",
    pronunciation: "deh DOHN-deh EH-rehs",
    context: "Useful when meeting someone new.",
  },
  {
    phrase: "Soy de...",
    translation: "I am from...",
    pronunciation: "soy deh",
    context: "Follow up with your country, e.g. 'Soy de México'.",
  },
];

// ── Activities ────────────────────────────────────────────────────────────────

const es1VocabActivities: Activity[] = [
  {
    id: "es-1-1-act-1",
    type: "multiple_choice",
    prompt: "What does 'hola' mean?",
    options: [
      { id: "a", text: "Goodbye", isCorrect: false },
      { id: "b", text: "Hello", isCorrect: true },
      { id: "c", text: "Please", isCorrect: false },
      { id: "d", text: "Thank you", isCorrect: false },
    ],
    xpReward: 10,
  },
  {
    id: "es-1-1-act-2",
    type: "multiple_choice",
    prompt: "How do you say 'thank you' in Spanish?",
    options: [
      { id: "a", text: "por favor", isCorrect: false },
      { id: "b", text: "adiós", isCorrect: false },
      { id: "c", text: "gracias", isCorrect: true },
      { id: "d", text: "hola", isCorrect: false },
    ],
    xpReward: 10,
  },
  {
    id: "es-1-1-act-3",
    type: "fill_in_blank",
    prompt: "Complete the greeting:",
    sentence: "¡___! ¿Cómo estás?",
    blankToken: "___",
    correctAnswer: "Hola",
    hint: "The most basic Spanish greeting.",
    xpReward: 15,
  },
  {
    id: "es-1-1-act-4",
    type: "match_pairs",
    prompt: "Match each Spanish word to its English meaning.",
    // pairs are encoded as options where id matches partner id
    options: [
      { id: "hola", text: "hola", isCorrect: true },
      { id: "hello", text: "hello", isCorrect: true },
      { id: "adios", text: "adiós", isCorrect: true },
      { id: "goodbye", text: "goodbye", isCorrect: true },
      { id: "gracias", text: "gracias", isCorrect: true },
      { id: "thankyou", text: "thank you", isCorrect: true },
    ],
    xpReward: 20,
  },
  {
    id: "es-1-1-act-5",
    type: "arrange_words",
    prompt: "Arrange the words to form a correct sentence:",
    wordBank: ["llamo", "Me", "Ana"],
    correctAnswer: "Me llamo Ana",
    xpReward: 15,
  },
];

const es1PhraseActivities: Activity[] = [
  {
    id: "es-1-2-act-1",
    type: "multiple_choice",
    prompt: "What does '¿Cómo te llamas?' mean?",
    options: [
      { id: "a", text: "How are you?", isCorrect: false },
      { id: "b", text: "Where are you from?", isCorrect: false },
      { id: "c", text: "What is your name?", isCorrect: true },
      { id: "d", text: "Nice to meet you.", isCorrect: false },
    ],
    xpReward: 10,
  },
  {
    id: "es-1-2-act-2",
    type: "true_or_false",
    prompt: "'Estoy bien' means 'I am fine' — true or false?",
    options: [
      { id: "true", text: "True", isCorrect: true },
      { id: "false", text: "False", isCorrect: false },
    ],
    xpReward: 10,
  },
  {
    id: "es-1-2-act-3",
    type: "fill_in_blank",
    prompt: "Complete the sentence:",
    sentence: "Soy ___ México.",
    blankToken: "___",
    correctAnswer: "de",
    hint: "The Spanish preposition that means 'from'.",
    xpReward: 15,
  },
];

const es1AudioActivities: Activity[] = [
  {
    id: "es-1-3-act-1",
    type: "listen_and_repeat",
    prompt: "Listen and repeat: '¡Hola! Me llamo Carlos.'",
    xpReward: 10,
  },
  {
    id: "es-1-3-act-2",
    type: "listen_and_repeat",
    prompt: "Listen and repeat: '¿Cómo estás? Estoy bien, gracias.'",
    xpReward: 10,
  },
  {
    id: "es-1-3-act-3",
    type: "speak_it",
    prompt: "Say the following phrase aloud: 'Mucho gusto, soy de España.'",
    correctAnswer: "Mucho gusto, soy de España.",
    xpReward: 20,
  },
];

// ── Goals ─────────────────────────────────────────────────────────────────────

const es1VocabGoals: LessonGoal[] = [
  { description: "Learn 6 essential Spanish greetings", skill: "vocabulary" },
  { description: "Understand when to use formal vs informal greetings", skill: "reading" },
];

const es1PhraseGoals: LessonGoal[] = [
  { description: "Use 5 key conversation-starter phrases", skill: "vocabulary" },
  { description: "Construct simple self-introduction sentences", skill: "grammar" },
];

const es1AudioGoals: LessonGoal[] = [
  { description: "Practise Spanish vowel sounds", skill: "pronunciation" },
  { description: "Improve listening comprehension of basic greetings", skill: "listening" },
  { description: "Speak a short phrase clearly", skill: "speaking" },
];

// ── AI Teacher Prompt ─────────────────────────────────────────────────────────

const es1AITeacherPrompt: AITeacherPrompt = {
  teacherPersona:
    "You are Sofía, a friendly and encouraging Spanish teacher from Madrid. " +
    "You speak clearly, use simple vocabulary, and celebrate small wins with the student. " +
    "You mix a tiny bit of humour to keep the mood light.",
  lessonTopic: "Greetings and self-introductions in Spanish",
  targetLanguage: "Spanish",
  nativeLanguage: "English",
  difficulty: "beginner",
  keyVocabulary: ["hola", "adiós", "gracias", "por favor", "me llamo", "mucho gusto"],
  grammarFocus: "Subject pronouns: yo, tú — and the verb 'ser' (to be) in first person",
  openingScript:
    "¡Hola! Welcome to your first Spanish lesson! I'm Sofía and I'm so excited to " +
    "be your teacher today. Don't worry — we're starting super simple, I promise. " +
    "By the end of this session you'll be able to introduce yourself in Spanish. Ready? ¡Vamos!",
  teachingNotes:
    "Keep corrections gentle and immediate. When the student makes an error, " +
    "model the correct form naturally in your next sentence rather than explicitly pointing out the mistake. " +
    "Encourage the student to repeat phrases back to you. " +
    "Spend extra time on the pronunciation of 'll' (as in 'me llamo') and the rolled 'r'.",
};

const es1AIActivities: Activity[] = [
  {
    id: "es-1-4-act-1",
    type: "speak_it",
    prompt: "Introduce yourself to Sofía — tell her your name and where you are from.",
    xpReward: 30,
  },
];

// ── Lessons ───────────────────────────────────────────────────────────────────

const esLesson1_1: Lesson = {
  id: "es-1-1-vocab",
  unitId: "es-unit-1",
  title: "Hello & Goodbye",
  description: "Learn the most essential Spanish words for starting and ending a conversation.",
  type: "vocabulary",
  order: 1,
  durationMinutes: 5,
  goals: es1VocabGoals,
  vocabulary: es1Vocab,
  phrases: [],
  activities: es1VocabActivities,
  totalXP: calcTotalXP(es1VocabActivities),
  isLocked: false,
  iconName: "hand.wave",
};

const esLesson1_2: Lesson = {
  id: "es-1-2-phrases",
  unitId: "es-unit-1",
  title: "Nice to Meet You",
  description: "Greet people properly and ask for their name — your first real conversation.",
  type: "conversation",
  order: 2,
  durationMinutes: 6,
  goals: es1PhraseGoals,
  vocabulary: [],
  phrases: es1Phrases,
  activities: es1PhraseActivities,
  totalXP: calcTotalXP(es1PhraseActivities),
  isLocked: true,
  iconName: "person.2",
};

const esLesson1_3: Lesson = {
  id: "es-1-3-audio",
  unitId: "es-unit-1",
  title: "Sounds of Spanish",
  description: "Train your ear and mouth — listen to native audio and repeat key phrases.",
  type: "audio",
  order: 3,
  durationMinutes: 5,
  goals: es1AudioGoals,
  vocabulary: [],
  phrases: es1Phrases,
  activities: es1AudioActivities,
  totalXP: calcTotalXP(es1AudioActivities),
  isLocked: true,
  iconName: "speaker.wave.2",
};

const esLesson1_4: Lesson = {
  id: "es-1-4-ai-teacher",
  unitId: "es-unit-1",
  title: "Live with Sofía",
  description: "Have a real conversation with your AI teacher Sofía and put it all together.",
  type: "ai_teacher",
  order: 4,
  durationMinutes: 10,
  goals: [
    { description: "Hold a simple introductory conversation in Spanish", skill: "speaking" },
    { description: "Respond naturally to basic greetings", skill: "listening" },
  ],
  vocabulary: es1Vocab,
  phrases: es1Phrases,
  activities: es1AIActivities,
  totalXP: calcTotalXP(es1AIActivities),
  aiTeacherPrompt: es1AITeacherPrompt,
  isLocked: true,
  iconName: "video.circle",
};

// ──────────────────── Spanish Unit 2: Numbers & Time ──────────────────────────

const es2Vocab: VocabItem[] = [
  { word: "uno", translation: "one", partOfSpeech: "noun" },
  { word: "dos", translation: "two", partOfSpeech: "noun" },
  { word: "tres", translation: "three", partOfSpeech: "noun" },
  { word: "cuatro", translation: "four", partOfSpeech: "noun" },
  { word: "cinco", translation: "five", partOfSpeech: "noun" },
  { word: "diez", translation: "ten", partOfSpeech: "noun" },
  { word: "¿Qué hora es?", translation: "What time is it?", partOfSpeech: "phrase" },
  { word: "Es la una.", translation: "It is one o'clock.", partOfSpeech: "phrase" },
];

const es2VocabActivities: Activity[] = [
  {
    id: "es-2-1-act-1",
    type: "multiple_choice",
    prompt: "What does 'tres' mean?",
    options: [
      { id: "a", text: "Two", isCorrect: false },
      { id: "b", text: "Three", isCorrect: true },
      { id: "c", text: "Four", isCorrect: false },
      { id: "d", text: "Five", isCorrect: false },
    ],
    xpReward: 10,
  },
  {
    id: "es-2-1-act-2",
    type: "arrange_words",
    prompt: "Arrange the words to ask for the time:",
    wordBank: ["es", "hora", "¿Qué", "?"],
    correctAnswer: "¿Qué hora es?",
    xpReward: 15,
  },
];

const es2GrammarActivities: Activity[] = [
  {
    id: "es-2-2-act-1",
    type: "fill_in_blank",
    prompt: "Complete: 'Es ___ una.' (It is one o'clock.)",
    sentence: "Es ___ una.",
    blankToken: "___",
    correctAnswer: "la",
    hint: "Spanish uses the feminine article before 'una' when telling time.",
    xpReward: 15,
  },
  {
    id: "es-2-2-act-2",
    type: "true_or_false",
    prompt: "'Dos' means 'three' — true or false?",
    options: [
      { id: "true", text: "True", isCorrect: false },
      { id: "false", text: "False", isCorrect: true },
    ],
    xpReward: 10,
  },
];

const es2AudioActivities: Activity[] = [
  {
    id: "es-2-3-act-1",
    type: "listen_and_repeat",
    prompt: "Listen and repeat the numbers: uno, dos, tres, cuatro, cinco.",
    xpReward: 10,
  },
  {
    id: "es-2-3-act-2",
    type: "speak_it",
    prompt: "Say aloud: '¿Qué hora es? Son las tres.'",
    correctAnswer: "¿Qué hora es? Son las tres.",
    xpReward: 20,
  },
];

const esLesson2_1: Lesson = {
  id: "es-2-1-vocab",
  unitId: "es-unit-2",
  title: "1, 2, 3 — Numbers",
  description: "Learn numbers 1-10 and start counting in Spanish.",
  type: "vocabulary",
  order: 1,
  durationMinutes: 5,
  goals: [
    { description: "Learn numbers 1 to 10 in Spanish", skill: "vocabulary" },
  ],
  vocabulary: es2Vocab,
  phrases: [],
  activities: es2VocabActivities,
  totalXP: calcTotalXP(es2VocabActivities),
  isLocked: true,
  iconName: "number",
};

const esLesson2_2: Lesson = {
  id: "es-2-2-grammar",
  unitId: "es-unit-2",
  title: "What Time Is It?",
  description: "Learn to tell the time with 'es la' and 'son las'.",
  type: "grammar",
  order: 2,
  durationMinutes: 6,
  goals: [
    { description: "Use 'es la' and 'son las' correctly for time", skill: "grammar" },
  ],
  vocabulary: es2Vocab,
  phrases: [
    {
      phrase: "¿Qué hora es?",
      translation: "What time is it?",
      pronunciation: "keh OH-rah ehs",
      context: "Universal — ask this anywhere.",
    },
    {
      phrase: "Son las dos.",
      translation: "It is two o'clock.",
      pronunciation: "son lahs dohs",
      context: "Use 'son las' for all hours except 1 o'clock.",
    },
  ],
  activities: es2GrammarActivities,
  totalXP: calcTotalXP(es2GrammarActivities),
  isLocked: true,
  iconName: "clock",
};

const esLesson2_3: Lesson = {
  id: "es-2-3-audio",
  unitId: "es-unit-2",
  title: "Count Out Loud",
  description: "Practise your number pronunciation with native audio.",
  type: "audio",
  order: 3,
  durationMinutes: 5,
  goals: [
    { description: "Pronounce Spanish numbers clearly", skill: "pronunciation" },
  ],
  vocabulary: es2Vocab,
  phrases: [],
  activities: es2AudioActivities,
  totalXP: calcTotalXP(es2AudioActivities),
  isLocked: true,
  iconName: "ear",
};

// ═════════════════════════════════════════════════════════════════════════════
// FRENCH — Unit 1: Greetings & Introductions
// ═════════════════════════════════════════════════════════════════════════════

const fr1Vocab: VocabItem[] = [
  {
    word: "bonjour",
    translation: "hello / good day",
    partOfSpeech: "phrase",
    exampleSentence: "Bonjour, comment allez-vous?",
    exampleTranslation: "Hello, how are you? (formal)",
  },
  {
    word: "bonsoir",
    translation: "good evening",
    partOfSpeech: "phrase",
    exampleSentence: "Bonsoir, enchanté de vous voir.",
    exampleTranslation: "Good evening, lovely to see you.",
  },
  {
    word: "au revoir",
    translation: "goodbye",
    partOfSpeech: "phrase",
    exampleSentence: "Au revoir, à demain!",
    exampleTranslation: "Goodbye, see you tomorrow!",
  },
  {
    word: "merci",
    translation: "thank you",
    partOfSpeech: "phrase",
    exampleSentence: "Merci beaucoup!",
    exampleTranslation: "Thank you very much!",
  },
  {
    word: "s'il vous plaît",
    translation: "please (formal)",
    partOfSpeech: "phrase",
    exampleSentence: "Un café, s'il vous plaît.",
    exampleTranslation: "A coffee, please.",
  },
  {
    word: "je m'appelle",
    translation: "my name is",
    partOfSpeech: "phrase",
    exampleSentence: "Je m'appelle Marie.",
    exampleTranslation: "My name is Marie.",
  },
];

const fr1Phrases: Phrase[] = [
  {
    phrase: "Comment vous appelez-vous?",
    translation: "What is your name? (formal)",
    pronunciation: "koh-MAHN voo za-PLAY voo",
    context: "Formal — use in professional or unfamiliar settings.",
  },
  {
    phrase: "Comment tu t'appelles?",
    translation: "What is your name? (informal)",
    pronunciation: "koh-MAHN tew ta-PEL",
    context: "Informal — use with peers and friends.",
  },
  {
    phrase: "Enchanté(e).",
    translation: "Nice to meet you.",
    pronunciation: "ahn-shahn-TAY",
    context: "Add an 'e' at the end if you are a woman: enchantée.",
  },
  {
    phrase: "Je suis de...",
    translation: "I am from...",
    pronunciation: "zhuh SWEE duh",
    context: "Follow with your country: 'Je suis de France.'",
  },
];

const fr1VocabActivities: Activity[] = [
  {
    id: "fr-1-1-act-1",
    type: "multiple_choice",
    prompt: "What does 'bonjour' mean?",
    options: [
      { id: "a", text: "Goodbye", isCorrect: false },
      { id: "b", text: "Please", isCorrect: false },
      { id: "c", text: "Hello / Good day", isCorrect: true },
      { id: "d", text: "Thank you", isCorrect: false },
    ],
    xpReward: 10,
  },
  {
    id: "fr-1-1-act-2",
    type: "fill_in_blank",
    prompt: "Complete the greeting:",
    sentence: "Je m'___ Marie.",
    blankToken: "___",
    correctAnswer: "appelle",
    hint: "The French verb 'appeler' conjugated as 'je m'appelle'.",
    xpReward: 15,
  },
  {
    id: "fr-1-1-act-3",
    type: "arrange_words",
    prompt: "Arrange the words to say 'thank you very much':",
    wordBank: ["beaucoup", "Merci"],
    correctAnswer: "Merci beaucoup",
    xpReward: 10,
  },
];

const fr1PhraseActivities: Activity[] = [
  {
    id: "fr-1-2-act-1",
    type: "multiple_choice",
    prompt: "Which phrase is informal?",
    options: [
      { id: "a", text: "Comment vous appelez-vous?", isCorrect: false },
      { id: "b", text: "Comment tu t'appelles?", isCorrect: true },
      { id: "c", text: "Bonjour, monsieur.", isCorrect: false },
      { id: "d", text: "S'il vous plaît.", isCorrect: false },
    ],
    xpReward: 10,
  },
  {
    id: "fr-1-2-act-2",
    type: "true_or_false",
    prompt: "'Enchanté' means 'goodbye' — true or false?",
    options: [
      { id: "true", text: "True", isCorrect: false },
      { id: "false", text: "False", isCorrect: true },
    ],
    xpReward: 10,
  },
];

const fr1AITeacherPrompt: AITeacherPrompt = {
  teacherPersona:
    "You are Camille, a warm and passionate French teacher from Lyon. " +
    "You love the elegance of French and gently correct pronunciation mistakes. " +
    "You are patient and use positive reinforcement frequently.",
  lessonTopic: "Greetings and introductions in French",
  targetLanguage: "French",
  nativeLanguage: "English",
  difficulty: "beginner",
  keyVocabulary: ["bonjour", "bonsoir", "au revoir", "merci", "je m'appelle", "enchanté"],
  grammarFocus: "Reflexive verb 's'appeler' and formal vs informal register (vous / tu)",
  openingScript:
    "Bonjour! Welcome to your first French lesson! I'm Camille, and I'm delighted to guide " +
    "you through this beautiful language. Don't be shy — even making mistakes is part of the journey. " +
    "By the time we finish today, you'll know how to greet people and introduce yourself. Allons-y!",
  teachingNotes:
    "Spend time on the nasal vowel sounds in 'bonjour' and 'enchanté'. " +
    "Explain the formal/informal distinction early — it's a common source of confusion for English speakers. " +
    "Use plenty of encouragement and repeat key phrases multiple times before asking the student to say them.",
};

const fr1AIActivities: Activity[] = [
  {
    id: "fr-1-3-act-1",
    type: "speak_it",
    prompt: "Greet Camille and introduce yourself in French.",
    xpReward: 30,
  },
];

const frLesson1_1: Lesson = {
  id: "fr-1-1-vocab",
  unitId: "fr-unit-1",
  title: "Bonjour! — Hello in French",
  description: "Your very first French words: greetings, farewells, and politeness.",
  type: "vocabulary",
  order: 1,
  durationMinutes: 5,
  goals: [
    { description: "Learn 6 core French greetings and courtesy words", skill: "vocabulary" },
  ],
  vocabulary: fr1Vocab,
  phrases: [],
  activities: fr1VocabActivities,
  totalXP: calcTotalXP(fr1VocabActivities),
  isLocked: false,
  iconName: "hand.wave",
};

const frLesson1_2: Lesson = {
  id: "fr-1-2-phrases",
  unitId: "fr-unit-1",
  title: "Formal vs Informal",
  description: "Learn when to use 'vous' and 'tu' — a key French social skill.",
  type: "conversation",
  order: 2,
  durationMinutes: 6,
  goals: [
    { description: "Distinguish formal and informal register in French", skill: "grammar" },
    { description: "Introduce yourself using key phrases", skill: "speaking" },
  ],
  vocabulary: [],
  phrases: fr1Phrases,
  activities: fr1PhraseActivities,
  totalXP: calcTotalXP(fr1PhraseActivities),
  isLocked: true,
  iconName: "person.2",
};

const frLesson1_3: Lesson = {
  id: "fr-1-3-ai-teacher",
  unitId: "fr-unit-1",
  title: "Live with Camille",
  description: "Chat live with Camille, your AI French teacher, and practice everything you learned.",
  type: "ai_teacher",
  order: 3,
  durationMinutes: 10,
  goals: [
    { description: "Hold a simple French greeting conversation", skill: "speaking" },
    { description: "Respond to questions about your name and origin", skill: "listening" },
  ],
  vocabulary: fr1Vocab,
  phrases: fr1Phrases,
  activities: fr1AIActivities,
  totalXP: calcTotalXP(fr1AIActivities),
  aiTeacherPrompt: fr1AITeacherPrompt,
  isLocked: true,
  iconName: "video.circle",
};

// ═════════════════════════════════════════════════════════════════════════════
// JAPANESE — Unit 1: Hiragana Basics
// ═════════════════════════════════════════════════════════════════════════════

const ja1Vocab: VocabItem[] = [
  {
    word: "こんにちは",
    translation: "hello",
    romanization: "Konnichiwa",
    partOfSpeech: "phrase",
    exampleSentence: "こんにちは、はじめまして。",
    exampleTranslation: "Hello, nice to meet you.",
  },
  {
    word: "おはようございます",
    translation: "good morning (formal)",
    romanization: "Ohayō gozaimasu",
    partOfSpeech: "phrase",
    exampleSentence: "おはようございます、先生。",
    exampleTranslation: "Good morning, teacher.",
  },
  {
    word: "こんばんは",
    translation: "good evening",
    romanization: "Konbanwa",
    partOfSpeech: "phrase",
    exampleSentence: "こんばんは！",
    exampleTranslation: "Good evening!",
  },
  {
    word: "さようなら",
    translation: "goodbye",
    romanization: "Sayōnara",
    partOfSpeech: "phrase",
    exampleSentence: "さようなら、またね。",
    exampleTranslation: "Goodbye, see you again.",
  },
  {
    word: "ありがとう",
    translation: "thank you (casual)",
    romanization: "Arigatō",
    partOfSpeech: "phrase",
    exampleSentence: "ありがとう！",
    exampleTranslation: "Thank you!",
  },
  {
    word: "はじめまして",
    translation: "nice to meet you",
    romanization: "Hajimemashite",
    partOfSpeech: "phrase",
    exampleSentence: "はじめまして、わたしはケンです。",
    exampleTranslation: "Nice to meet you, I am Ken.",
  },
];

const ja1Phrases: Phrase[] = [
  {
    phrase: "おなまえは？",
    translation: "What is your name?",
    pronunciation: "O-na-mae-wa?",
    context: "Casual — used with friends or people of similar age.",
  },
  {
    phrase: "わたしは___です。",
    translation: "I am ___.",
    pronunciation: "Watashi wa ___ desu.",
    context: "Replace ___ with your name.",
  },
  {
    phrase: "よろしくおねがいします。",
    translation: "Nice to meet you / Please treat me well.",
    pronunciation: "Yoroshiku onegaishimasu.",
    context: "Formal version of はじめまして — used in professional settings.",
  },
];

const ja1VocabActivities: Activity[] = [
  {
    id: "ja-1-1-act-1",
    type: "multiple_choice",
    prompt: "What does 'こんにちは' (Konnichiwa) mean?",
    options: [
      { id: "a", text: "Good morning", isCorrect: false },
      { id: "b", text: "Good evening", isCorrect: false },
      { id: "c", text: "Hello", isCorrect: true },
      { id: "d", text: "Goodbye", isCorrect: false },
    ],
    xpReward: 10,
  },
  {
    id: "ja-1-1-act-2",
    type: "multiple_choice",
    prompt: "Which word means 'thank you' in Japanese?",
    options: [
      { id: "a", text: "さようなら", isCorrect: false },
      { id: "b", text: "ありがとう", isCorrect: true },
      { id: "c", text: "こんばんは", isCorrect: false },
      { id: "d", text: "はじめまして", isCorrect: false },
    ],
    xpReward: 10,
  },
  {
    id: "ja-1-1-act-3",
    type: "match_pairs",
    prompt: "Match the Japanese greeting to its English meaning.",
    options: [
      { id: "konnichiwa", text: "こんにちは", isCorrect: true },
      { id: "hello", text: "hello", isCorrect: true },
      { id: "sayonara", text: "さようなら", isCorrect: true },
      { id: "goodbye", text: "goodbye", isCorrect: true },
    ],
    xpReward: 20,
  },
];

const ja1PhraseActivities: Activity[] = [
  {
    id: "ja-1-2-act-1",
    type: "fill_in_blank",
    prompt: "Complete the introduction:",
    sentence: "わたしは___です。",
    blankToken: "___",
    correctAnswer: "ケン",
    hint: "Replace the blank with a name. Here we use 'Ken' (ケン).",
    xpReward: 15,
  },
  {
    id: "ja-1-2-act-2",
    type: "true_or_false",
    prompt: "'よろしくおねがいします' is a casual phrase — true or false?",
    options: [
      { id: "true", text: "True", isCorrect: false },
      { id: "false", text: "False", isCorrect: true },
    ],
    xpReward: 10,
  },
];

const ja1AudioActivities: Activity[] = [
  {
    id: "ja-1-3-act-1",
    type: "listen_and_repeat",
    prompt: "Listen and repeat: 'こんにちは、はじめまして。わたしはケンです。'",
    xpReward: 10,
  },
  {
    id: "ja-1-3-act-2",
    type: "speak_it",
    prompt: "Say the following aloud: 'ありがとうございます。よろしくおねがいします。'",
    correctAnswer: "ありがとうございます。よろしくおねがいします。",
    xpReward: 20,
  },
];

const jaLesson1_1: Lesson = {
  id: "ja-1-1-vocab",
  unitId: "ja-unit-1",
  title: "Konnichiwa! — Japanese Greetings",
  description: "Learn the most important Japanese greetings and when to use them.",
  type: "vocabulary",
  order: 1,
  durationMinutes: 6,
  goals: [
    { description: "Learn 6 essential Japanese greetings", skill: "vocabulary" },
    { description: "Understand time-based greetings (morning/evening)", skill: "reading" },
  ],
  vocabulary: ja1Vocab,
  phrases: [],
  activities: ja1VocabActivities,
  totalXP: calcTotalXP(ja1VocabActivities),
  isLocked: false,
  iconName: "hand.wave",
};

const jaLesson1_2: Lesson = {
  id: "ja-1-2-phrases",
  unitId: "ja-unit-1",
  title: "Introduce Yourself",
  description: "Learn the key phrases to meet new people and tell them your name in Japanese.",
  type: "conversation",
  order: 2,
  durationMinutes: 6,
  goals: [
    { description: "Use 'watashi wa ... desu' to introduce yourself", skill: "grammar" },
    { description: "Distinguish casual from formal greetings", skill: "vocabulary" },
  ],
  vocabulary: [],
  phrases: ja1Phrases,
  activities: ja1PhraseActivities,
  totalXP: calcTotalXP(ja1PhraseActivities),
  isLocked: true,
  iconName: "person.2",
};

const jaLesson1_3: Lesson = {
  id: "ja-1-3-audio",
  unitId: "ja-unit-1",
  title: "Sound Like a Local",
  description: "Train your ear with native Japanese audio and practise the rhythm of the language.",
  type: "audio",
  order: 3,
  durationMinutes: 5,
  goals: [
    { description: "Improve Japanese pronunciation and rhythm", skill: "pronunciation" },
    { description: "Listen and understand basic spoken greetings", skill: "listening" },
  ],
  vocabulary: ja1Vocab,
  phrases: ja1Phrases,
  activities: ja1AudioActivities,
  totalXP: calcTotalXP(ja1AudioActivities),
  isLocked: true,
  iconName: "ear",
};

// ═════════════════════════════════════════════════════════════════════════════
// COMBINED EXPORTS
// ═════════════════════════════════════════════════════════════════════════════

/** All lessons for Spanish */
export const spanishLessons: Lesson[] = [
  esLesson1_1,
  esLesson1_2,
  esLesson1_3,
  esLesson1_4,
  esLesson2_1,
  esLesson2_2,
  esLesson2_3,
];

/** All lessons for French */
export const frenchLessons: Lesson[] = [
  frLesson1_1,
  frLesson1_2,
  frLesson1_3,
];

/** All lessons for Japanese */
export const japaneseLessons: Lesson[] = [
  jaLesson1_1,
  jaLesson1_2,
  jaLesson1_3,
];

/**
 * All lessons across all languages.
 * Usage: `allLessons.find(l => l.id === "es-1-1-vocab")`
 */
export const allLessons: Lesson[] = [
  ...spanishLessons,
  ...frenchLessons,
  ...japaneseLessons,
];

/**
 * All lessons indexed by language code.
 * Usage: `lessonsByLanguage["es"]` → Spanish lessons array.
 */
export const lessonsByLanguage: Record<string, Lesson[]> = {
  es: spanishLessons,
  fr: frenchLessons,
  ja: japaneseLessons,
};

/**
 * Look up a single lesson by ID.
 * Returns undefined if not found.
 */
export function getLessonById(id: string): Lesson | undefined {
  return allLessons.find((lesson) => lesson.id === id);
}

/**
 * Get all lessons belonging to a specific unit.
 */
export function getLessonsForUnit(unitId: string): Lesson[] {
  return allLessons.filter((lesson) => lesson.unitId === unitId);
}
