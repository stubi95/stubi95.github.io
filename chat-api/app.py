import os
from typing import Literal

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from starlette.responses import JSONResponse

load_dotenv()

app = FastAPI(title="Stubanus Consulting Chat Assistant")

# The API serves two public sites. Extra origins may be configured as a
# comma-separated ALLOWED_ORIGINS value; the former single-origin setting is
# still accepted for existing deployments.
_origins = {
    "https://stubi95.github.io",
    "https://stubanus-consulting.de",
    "https://www.stubanus-consulting.de",
}
_origins.update(
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip() and origin.strip() != "*"
)
_legacy_origin = os.getenv("ALLOWED_ORIGIN", "").strip()
if _legacy_origin and _legacy_origin != "*":
    _origins.add(_legacy_origin)
ALLOWED_ORIGINS = sorted(_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["content-type"],
)

try:
    with open("system_prompt.txt", encoding="utf-8") as file:
        PORTFOLIO_PROMPT = file.read()
    with open("consulting_prompt.txt", encoding="utf-8") as file:
        CONSULTING_PROMPT = file.read()
except OSError as exc:
    raise RuntimeError("Both assistant prompts must be present beside app.py") from exc

api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key or api_key == "your_anthropic_api_key_here":
    print("WARNING: ANTHROPIC_API_KEY is not set correctly in .env")

try:
    client = anthropic.Anthropic(api_key=api_key) if api_key else None
except Exception as exc:
    client = None
    print(f"Failed to initialize Anthropic client: {type(exc).__name__}")


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=1000)


class ChatRequest(BaseModel):
    messages: list[Message] = Field(min_length=1, max_length=12)
    mode: Literal["portfolio", "consulting"] = "portfolio"


@app.middleware("http")
async def require_allowed_chat_origin(request: Request, call_next):
    if request.url.path == "/api/chat" and request.method == "POST":
        origin = request.headers.get("origin")
        if origin not in ALLOWED_ORIGINS:
            return JSONResponse(status_code=403, content={"detail": "Origin not allowed"})
    return await call_next(request)


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    if not client:
        raise HTTPException(status_code=503, detail="Chat service unavailable")
    if request.messages[-1].role != "user":
        raise HTTPException(status_code=422, detail="The last message must be from the user")

    messages = [message.model_dump() for message in request.messages]
    prompt = CONSULTING_PROMPT if request.mode == "consulting" else PORTFOLIO_PROMPT
    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=700,
            system=prompt,
            messages=messages,
        )
        answer = next((block.text for block in response.content if block.type == "text"), "")
        if not answer:
            raise HTTPException(status_code=502, detail="No answer received")
        return JSONResponse(
            content={"response": answer},
            headers={"Cache-Control": "no-store", "Referrer-Policy": "no-referrer"},
        )
    except HTTPException:
        raise
    except Exception as exc:
        # Keep provider diagnostics useful while never logging the submitted chat text.
        detail = str(exc).replace(api_key or "", "[redacted]")[:240]
        print(f"Chat provider request failed: {type(exc).__name__}: {detail}")
        raise HTTPException(status_code=502, detail="The chat service could not answer right now") from None


@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API is running."}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
