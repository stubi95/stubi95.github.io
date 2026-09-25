# stubi95.github.io

Portfolio site and API-backed AI assistant. The chatbot on the portfolio sends
messages to `/api/chat` at `chat.nutrition-fit.com` using Anthropic's commercial
API. The consulting site selects a separate prompt with `mode: "consulting"`;
portfolio requests keep the original assistant prompt by default.

## API deployment

Build the API image from this directory with `chat-api` as the Docker build
context. `chat-api/.dockerignore` excludes local environment files, including
`ANTHROPIC_API_KEY`, from that context. Supply the API key at runtime through
`ANTHROPIC_API_KEY`. The public site origins are allow-listed in `app.py`; any
additional exact origin can be configured using comma-separated
`ALLOWED_ORIGINS`.
