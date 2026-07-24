# ---------------------------------------------------------------------------
# Lingua Teacher Agent — Production Dockerfile
#
# Build:   docker buildx build --platform linux/amd64 -t lingua-teacher .
# Run:     docker run --env-file .env -p 8080:8080 lingua-teacher
# ---------------------------------------------------------------------------

FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY pyproject.toml ./

# Install dependencies into the project venv (no editable install)
RUN uv sync --no-dev

# Copy source
COPY agent.py ./

# Run as a non-root user
RUN useradd --create-home appuser
USER appuser

EXPOSE 8080

# HTTP server mode by default
CMD ["uv", "run", "agent.py", "serve", "--host", "0.0.0.0", "--port", "8080"]
