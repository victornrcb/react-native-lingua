"""
lingua-teacher-agent
====================
A voice-only AI language teacher powered by Gemini 3.1 Flash Live Preview Real-time (Google AI Studio)
and Stream Edge (WebRTC transport).

Environment variables (loaded from ../.env first, then ./.env for overrides):
  STREAM_API_KEY     – Stream app key  (from parent .env)
  STREAM_API_SECRET  – Stream app secret (from parent .env)
  GOOGLE_API_KEY     – Google AI Studio key (added to vision-agent/.env)

Call-ID convention
  The mobile app creates calls with IDs in the form:
      lingua-<target-language>-<uuid>
  e.g.  lingua-spanish-abc123
        lingua-french-xyz789

  The agent reads lesson context from the call's custom data (packed by the
  mobile app before joining).  If custom data is absent, it falls back to
  parsing the language slug from the call ID.

Custom data fields (set by the mobile app via call.update):
  language            – Full language name, e.g. "Spanish"
  languageCode        – BCP-47 code, e.g. "es"
  lessonTitle         – Lesson display title
  goals               – List[str] of learning goal descriptions
  vocabulary          – List[str] of "word — translation" strings
  phrases             – List[str] of "phrase — translation" strings
  aiTeacherPersona    – Persona description for the teacher
  aiTeacherTopic      – Lesson topic sentence
  aiTeacherDifficulty – "beginner" | "intermediate" | "advanced"
  aiTeacherKeyVocab   – List[str] of key vocabulary words
  aiTeacherOpeningScript – Opening lines for the teacher
  aiTeacherNotes      – Extra teaching notes

Usage
  Development:   uv run agent.py run
  HTTP server:   uv run agent.py serve --host 0.0.0.0 --port 8080
"""

from __future__ import annotations

import logging
import os
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

from vision_agents.core import Agent, AgentLauncher, Runner, ServeOptions, User
from vision_agents.core.instructions import Instructions
from vision_agents.plugins import gemini, getstream

# ---------------------------------------------------------------------------
# Environment — load parent .env first so STREAM_* keys are available,
# then overlay the local .env so GOOGLE_API_KEY can be set without
# duplicating STREAM_* in this file.
# ---------------------------------------------------------------------------
_here = Path(__file__).parent
load_dotenv(_here.parent / ".env")          # parent repo .env  (STREAM_* keys)
load_dotenv(_here / ".env", override=True)  # local .env        (GOOGLE_API_KEY)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("lingua-teacher")

# ---------------------------------------------------------------------------
# Language name helpers
# ---------------------------------------------------------------------------

# Map of slug → full name used in the system prompt
_LANGUAGE_NAMES: dict[str, str] = {
    "spanish": "Spanish",
    "french": "French",
    "german": "German",
    "italian": "Italian",
    "portuguese": "Portuguese",
    "japanese": "Japanese",
    "chinese": "Mandarin Chinese",
    "mandarin": "Mandarin Chinese",
    "korean": "Korean",
    "arabic": "Arabic",
    "russian": "Russian",
    "dutch": "Dutch",
    "swedish": "Swedish",
    "norwegian": "Norwegian",
    "polish": "Polish",
    "turkish": "Turkish",
    "hindi": "Hindi",
}

_CALL_ID_RE = re.compile(r"^lingua-([a-z]+)-", re.IGNORECASE)


def _language_from_call_id(call_id: str) -> str:
    """
    Fallback: extract the target language from a call ID like 'lingua-spanish-abc123'.
    Returns 'Spanish' when the format is unrecognised.
    """
    match = _CALL_ID_RE.match(call_id)
    if not match:
        logger.warning(
            "call_id %r does not follow lingua-<lang>-<id> convention. Defaulting to Spanish.",
            call_id,
        )
        return "Spanish"

    slug = match.group(1).lower()
    name = _LANGUAGE_NAMES.get(slug)
    if name is None:
        logger.warning("Unknown language slug %r. Using title-cased name.", slug)
        name = slug.title()

    return name


# ---------------------------------------------------------------------------
# Instruction builders
# ---------------------------------------------------------------------------

def _build_instructions(
    target_language: str,
    lesson_title: str | None = None,
    goals: list[str] | None = None,
    vocabulary: list[str] | None = None,
    phrases: list[str] | None = None,
    persona: str | None = None,
    topic: str | None = None,
    difficulty: str | None = None,
    key_vocab: list[str] | None = None,
    opening_script: str | None = None,
    teaching_notes: str | None = None,
) -> str:
    """Build the full system prompt for the AI teacher from lesson context."""

    persona_line = (
        persona
        if persona
        else f"a friendly and encouraging AI language teacher"
    )

    difficulty_map = {
        "beginner": "Keep your language simple and speak slowly.",
        "intermediate": "Use moderately complex sentences and introduce idioms occasionally.",
        "advanced": "Use natural, fluent speech with rich vocabulary and idiomatic expressions.",
    }
    difficulty_guidance = difficulty_map.get(difficulty or "", difficulty_map["beginner"])

    lesson_section = ""
    if lesson_title:
        lesson_section = f"\n\nToday's lesson: \"{lesson_title}\"."
        if topic:
            lesson_section += f" Topic: {topic}."

    goals_section = ""
    if goals:
        goals_section = "\n\nLearning goals for this session:\n" + "\n".join(f"- {g}" for g in goals)

    vocab_section = ""
    if vocabulary:
        vocab_section = "\n\nVocabulary to cover in this lesson:\n" + "\n".join(f"- {v}" for v in vocabulary)
    elif key_vocab:
        vocab_section = "\n\nKey vocabulary to focus on:\n" + "\n".join(f"- {v}" for v in key_vocab)

    phrases_section = ""
    if phrases:
        phrases_section = "\n\nKey phrases to practise:\n" + "\n".join(f"- {p}" for p in phrases)

    notes_section = ""
    if teaching_notes:
        notes_section = f"\n\nTeaching notes: {teaching_notes}"

    return (
        f"You are Lingua, {persona_line}. "
        f"You are a {target_language} teacher. "
        f"The language you are teaching is {target_language} — and only {target_language}."
        f"{lesson_section}"
        f"\n\n"
        f"Language rules:\n"
        f"- Your default speaking language is English. Speak to the student in English."
        f" English is the medium of instruction.\n"
        f"- Use {target_language} only for: vocabulary words, example phrases, "
        f"or when asking the student to repeat a {target_language} word or sentence.\n"
        f"- Every {target_language} word or phrase you introduce should be followed "
        f"immediately by its English meaning.\n"
        f"- Never teach, reference, or use any language other than English and {target_language}.\n"
        f"\n"
        f"Difficulty: {difficulty or 'beginner'}. {difficulty_guidance}"
        f"{goals_section}"
        f"{vocab_section}"
        f"{phrases_section}"
        f"{notes_section}"
        f"\n\n"
        f"Teaching style:\n"
        f"- Keep responses short and conversational (2–4 sentences maximum).\n"
        f"- Speak naturally, as if in a friendly tutoring session.\n"
        f"- Correct the student gently when they make a mistake.\n"
        f"- Celebrate progress with brief, genuine encouragement.\n"
        f"- Introduce one concept or vocabulary item at a time.\n"
        f"- Adapt difficulty to the student's apparent level.\n"
        f"\n\n"
        f"You are voice-only: no markdown, no bullet lists, no headers in your replies — "
        f"speak in plain, natural sentences only."
    )


def _opening_prompt(
    target_language: str,
    opening_script: str | None = None,
    lesson_title: str | None = None,
) -> str:
    """Build the opening prompt sent after joining the call.

    Always names the target language explicitly so the Gemini Realtime model
    has an unambiguous anchor when generating its first spoken words.
    """
    if opening_script:
        return (
            f"You are teaching {target_language}. "
            f"Greet the student warmly and introduce yourself as Lingua, their {target_language} teacher. "
            f"Then deliver this opening: {opening_script}"
        )
    if lesson_title:
        return (
            f"You are teaching {target_language}. "
            f"Greet the student warmly, introduce yourself as Lingua, their {target_language} teacher, "
            f"and let them know today's {target_language} lesson is: \"{lesson_title}\". "
            f"Ask if they're ready to start learning {target_language} together."
        )
    return (
        f"You are teaching {target_language}. "
        f"Greet the student warmly, introduce yourself as Lingua, their {target_language} teacher, "
        f"and let them know you're here to help them learn {target_language}. "
        f"Ask what they'd like to work on — vocabulary, phrases, grammar, or conversation practice."
    )


# ---------------------------------------------------------------------------
# Agent factory — called once per session (never reuse an Agent instance)
# ---------------------------------------------------------------------------

async def create_agent(**kwargs: Any) -> Agent:
    """
    Factory function. Vision Agents calls this for every new session.
    Default instructions are overridden per-call in join_call once we
    have the call_id and can read the custom lesson data.
    """
    call_id = kwargs.get("call_id", "")
    target_language = _language_from_call_id(call_id)
    
    return Agent(
        edge=getstream.Edge(),
        agent_user=User(name="Lingua", id="lingua-teacher"),
        instructions=_build_instructions(target_language),
        llm=gemini.Realtime(
            model="gemini-3.1-flash-live-preview",
        ),
    )


# ---------------------------------------------------------------------------
# Call lifecycle
# ---------------------------------------------------------------------------

async def join_call(
    agent: Agent,
    call_type: str,
    call_id: str,
    **kwargs: Any,
) -> None:
    """
    Called when an agent session starts for a given call.

    1. Create the Stream call object and read its custom lesson data.
    2. Build rich, lesson-aware instructions from the custom data.
    3. Fall back to call-ID language parsing if no custom data is present.
    4. Join the call, call go_live() so the agent can publish audio in
       audio_room, greet the student, then wait for the call to end.
    """
    call = await agent.create_call(call_type, call_id)

    # ── Read custom lesson data packed by the mobile app ─────────────────────
    # The Stream Python SDK wraps every response in StreamResponse[T].
    # The actual payload is at  call_info.data  (a GetCallResponse object),
    # and the call details live at  call_info.data.call.custom.
    custom: dict[str, Any] = {}
    try:
        call_info = await call.get()
        # Navigate: StreamResponse → GetCallResponse (.data) → CallResponse (.call) → dict (.custom)
        raw_custom = call_info.data.call.custom
        custom = dict(raw_custom) if raw_custom else {}
        logger.info(
            "Lesson context received: language=%s, lesson=%s, difficulty=%s",
            custom.get("language"),
            custom.get("lessonTitle"),
            custom.get("aiTeacherDifficulty"),
        )
    except Exception as exc:
        logger.warning(
            "Could not read call custom data: %s (response type: %s). Falling back to call_id parsing.",
            exc,
            type(call_info).__name__ if "call_info" in dir() else "unknown",
        )

    # ── Resolve target language ───────────────────────────────────────────────
    target_language: str = (
        custom.get("language")
        or _language_from_call_id(call_id)
    )

    # ── Build lesson-aware instructions ──────────────────────────────────────
    instructions = _build_instructions(
        target_language=target_language,
        lesson_title=custom.get("lessonTitle"),
        goals=custom.get("goals"),
        vocabulary=custom.get("vocabulary"),
        phrases=custom.get("phrases"),
        persona=custom.get("aiTeacherPersona"),
        topic=custom.get("aiTeacherTopic"),
        difficulty=custom.get("aiTeacherDifficulty"),
        key_vocab=custom.get("aiTeacherKeyVocab"),
        opening_script=custom.get("aiTeacherOpeningScript"),
        teaching_notes=custom.get("aiTeacherNotes"),
    )
    logger.info("Instructions: \n%s", instructions)
    logger.info("Starting lesson: target_language=%s, call_id=%s", target_language, call_id)

    # Patch instructions before joining so the realtime session picks them up.
    agent.instructions = Instructions(input_text=instructions)
    if hasattr(agent.llm, "set_instructions"):
        agent.llm.set_instructions(instructions)

    opening = _opening_prompt(
        target_language=target_language,
        opening_script=custom.get("aiTeacherOpeningScript"),
        lesson_title=custom.get("lessonTitle"),
    )

    async with agent.join(call):
        # go_live() allows the agent to publish audio in audio_room call type.
        # This is a no-op for other call types, so it is safe to call always.
        try:
            await call.go_live()
            logger.info("go_live() called successfully for call_id=%s", call_id)
        except Exception as exc:
            logger.warning("go_live() failed (non-fatal): %s", exc)

        await agent.simple_response(opening)
        await agent.finish()


# ---------------------------------------------------------------------------
# Runner — entry point for both console (`run`) and HTTP server (`serve`)
# ---------------------------------------------------------------------------

runner = Runner(
    AgentLauncher(
        create_agent=create_agent,
        join_call=join_call,
        # Sensible defaults for a teaching app
        max_sessions_per_call=1,           # one teacher per lesson call
        agent_idle_timeout=120.0,          # disconnect if student leaves for 2 min
        max_session_duration_seconds=3600, # max 1-hour lesson
    ),
    serve_options=ServeOptions(
        cors_allow_origins=["*"],          # tighten in production
        cors_allow_methods=["*"],
        cors_allow_headers=["*"],
        cors_allow_credentials=True,
    ),
)

if __name__ == "__main__":
    runner.cli()
