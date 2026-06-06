import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Portfolio AI Recruiter Assistant")

# Configure CORS for security
# In production, ALLOWED_ORIGIN should be exactly your GitHub pages URL
# e.g., "https://stubi95.github.io"
allowed_origin = os.getenv("ALLOWED_ORIGIN", "https://stubi95.github.io")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin, "http://localhost:8000", "http://127.0.0.1:8000", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize Anthropic Client
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key or api_key == "your_anthropic_api_key_here":
    print("WARNING: ANTHROPIC_API_KEY is not set correctly in .env")

try:
    client = anthropic.Anthropic(api_key=api_key)
except Exception as e:
    client = None
    print(f"Failed to initialize Anthropic client: {e}")

# Load System Prompt
try:
    with open("system_prompt.txt", "r", encoding="utf-8") as f:
        SYSTEM_PROMPT = f.read()
except FileNotFoundError:
    SYSTEM_PROMPT = "You are an AI assistant for Alexander Stubanus."

# Define request/response models
class Message(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    if not client:
        raise HTTPException(status_code=500, detail="AI Client not properly configured.")
    
    try:
        # Convert Pydantic models to dictionaries expected by the Anthropic API
        formatted_messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Call Claude
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022", # Or claude-3-haiku-20240307 for faster/cheaper responses
            max_tokens=1000,
            temperature=0.7,
            system=SYSTEM_PROMPT,
            messages=formatted_messages
        )
        
        return {"response": response.content[0].text}
        
    except Exception as e:
        print(f"Error during API call: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API is running."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
