# Lingua — AI Language Teacher Agent

A voice-only AI language teacher micro-service built with
[Vision Agents](https://visionagents.ai), OpenAI Realtime, and Stream Edge.

The teacher always speaks **English** and teaches the selected target language
through English. The target language is encoded in the Stream call ID.

---

## Prerequisites

| Tool | Version |
|------|---------|
| [uv](https://docs.astral.sh/uv/) | ≥ 0.4 |
| Python | 3.10 – 3.13 |
| Stream account | [getstream.io/try-for-free](https://getstream.io/try-for-free/) |
| OpenAI account | [platform.openai.com](https://platform.openai.com/) |

---

## Setup

```bash
cd vision-agent

# 1. Install dependencies
uv sync

# 2. Add your OpenAI key (STREAM_* are loaded from the parent .env automatically)
echo "OPENAI_API_KEY=sk-..." >> .env
```

---

## Running

### Development (browser demo)

```bash
uv run agent.py run
```

Opens a browser demo at `http://localhost:8000` where you can talk to the
teacher. The call ID is auto-generated, so it defaults to Spanish.

To test a specific language pass `--call-id`:

```bash
uv run agent.py run --call-id lingua-french-test123
```

### HTTP server (production)

```bash
uv run agent.py serve --host 0.0.0.0 --port 8080
```

API docs available at `http://localhost:8080/docs`.

**Start a lesson session** (called by the mobile app):

```bash
curl -X POST http://localhost:8080/calls/lingua-spanish-abc123/sessions \
  -H "Content-Type: application/json" \
  -d '{"call_type": "default"}'
```

**Liveness / readiness:**

```bash
curl http://localhost:8080/health
curl http://localhost:8080/ready
```

### Docker

```bash
docker buildx build --platform linux/amd64 -t lingua-teacher .
docker run --env-file .env -p 8080:8080 lingua-teacher
```

---

## Call ID Convention

The mobile app creates Stream calls with IDs in the form:

```
lingua-<target-language>-<uuid>
```

Examples:

| Call ID | Target language |
|---------|----------------|
| `lingua-spanish-abc123` | Spanish |
| `lingua-french-xyz789` | French |
| `lingua-japanese-def456` | Japanese |

Supported slugs: `spanish`, `french`, `german`, `italian`, `portuguese`,
`japanese`, `chinese`, `mandarin`, `korean`, `arabic`, `russian`, `dutch`,
`swedish`, `norwegian`, `polish`, `turkish`, `hindi`.

Unknown slugs are accepted and title-cased automatically.

---

## Project Structure

```
vision-agent/
  agent.py          # Agent definition + runner
  pyproject.toml    # uv project — vision-agents[openai,getstream]
  .env              # OPENAI_API_KEY (add yours here)
  .env.example      # Template
  Dockerfile        # Production container
  README.md         # This file
```

---

## How It Works

1. **Mobile app** creates a Stream call with ID `lingua-<lang>-<uuid>`.
2. **Mobile app** `POST /calls/<call-id>/sessions` to this service.
3. **Agent service** spins up a new `Agent` instance (never reused).
4. **Agent** parses the language from the call ID, builds a tailored system prompt.
5. **OpenAI Realtime** handles STT + LLM + TTS in one speech-to-speech pass.
6. **Stream Edge** delivers audio over WebRTC to the student's device.
7. Agent auto-disconnects after 2 minutes of silence or a 1-hour maximum lesson.
