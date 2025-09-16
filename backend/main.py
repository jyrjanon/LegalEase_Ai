import base64
import vertexai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from fastapi.responses import StreamingResponse
import asyncio
import re

from vertexai.generative_models import GenerativeModel, Part, Content, HarmCategory, HarmBlockThreshold

# --- Pydantic Models ---
class AnalysisRequest(BaseModel):
    document: str
    language: str

class ImageRequest(BaseModel):
    image_data: str

class ChatPart(BaseModel):
    text: str

class ChatMessage(BaseModel):
    role: str
    parts: List[ChatPart]

class ChatRequest(BaseModel):
    document: str
    history: List[ChatMessage]
    question: str
    language: str

# --- FastAPI App ---
app = FastAPI()

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Vertex AI Initialization ---
PROJECT_ID = "genai-471305"
LOCATION = "us-central1"
vertexai.init(project=PROJECT_ID, location=LOCATION)

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "LegalEase AI Backend is running"}

@app.post("/analyze-text-stream")
async def analyze_document_stream(request: AnalysisRequest):
    """Analyzes text and streams a structured markdown summary back."""
    async def generate():
        try:
            model = GenerativeModel("gemini-2.5-flash")
            
            # UPDATED PROMPT for simpler, friendlier analysis
            prompt = f"""
            Act as a friendly personal legal adviser. Your goal is to help a common person understand this document.
            Your response must be in {request.language}. All explanations must be **very simple, short, and easy to understand.** Avoid legal jargon completely.

            Your response must be in Markdown format and strictly follow this structure:

            First, provide a "### Summary".
            Second, provide a "### Key Clauses Explained".
            Third, provide a "### My Advice To You".

            Under "Key Clauses Explained", list each important clause. For each clause:
            - Start the line with a `*`.
            - Use a 🔴 emoji for high-risk, 🟡 for medium-risk, and 🟢 for safe clauses.
            - Make the clause title bold (e.g., **Ending the Agreement**).
            - After the title, provide a one-sentence explanation of what it means in plain language.

            Under "My Advice To You", give short, practical, bullet-pointed advice that a regular person can easily act on.

            Document:
            ---
            {request.document}
            ---
            """
            stream = model.generate_content(prompt, stream=True)
            
            for chunk in stream:
                if chunk.text:
                    yield chunk.text
                    await asyncio.sleep(0.01)
        except Exception as e:
            print(f"Streaming analysis error: {e}")
            yield "An error occurred during analysis."
    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/extract-text-from-image")
async def extract_text_from_image(request: ImageRequest):
    try:
        model = GenerativeModel("gemini-2.5-flash")
        image_bytes = base64.b64decode(request.image_data)
        image_part = Part.from_data(data=image_bytes, mime_type="image/jpeg")
        prompt_parts = [image_part, "Extract all text from this image. Only return the extracted text."]
        response = model.generate_content(prompt_parts)
        return {"text": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting text from image: {e}")

@app.post("/chat-with-document")
async def chat_with_document(request: ChatRequest):
    """Handles follow-up questions about a document using a friendly, short-answer persona.
       Streams output while removing overlapping repeated chunks, and ensures the 'document does not mention' line
       is returned in bold followed by a newline.
    """
    async def generate():
        try:
            # tightened system prompt
            system_prompt = system_prompt = f"""
You are a friendly personal legal adviser.

Rules:
- Use short, simple English sentences.
- If the document covers the answer → explain from the document only.
- If the document does not cover → FIRST say in bold:
  **This document does not mention that.**
  Then on the next line, give a short, helpful general explanation
  based on your knowledge. 
- If the question is about costs (fees, rent agreement charges, stamp duty etc.), 
  give approximate amounts or typical ranges (₹ values) relevant to India. 
  Mention that these vary by city/state and must be confirmed locally.
- Do not repeat the same sentence twice.
- Keep total reply under 4 short sentences.

Language: {request.language}

--- LEGAL DOCUMENT CONTEXT ---
{request.document}
---
"""

            model_with_system_prompt = GenerativeModel(
                "gemini-2.5-flash",
                system_instruction=system_prompt
            )

            # Convert incoming history to Vertex Content objects
            history_content = [
                Content(role=msg.role, parts=[Part.from_text(part.text) for part in msg.parts])
                for msg in request.history
            ]

            chat = model_with_system_prompt.start_chat(history=history_content)
            stream = chat.send_message(request.question, stream=True)

            # Helper: remove overlap between previous output and new chunk
            def remove_prefix_overlap(prev_text: str, new_chunk: str) -> str:
                # find largest suffix of prev_text that is a prefix of new_chunk
                max_len = min(len(prev_text), len(new_chunk), 1000)  # limit search length
                for i in range(max_len, 0, -1):
                    if prev_text.endswith(new_chunk[:i]):
                        return new_chunk[i:]
                return new_chunk

            accumulated = ""  # full text we've yielded so far
            seen_output=""
            for chunk in stream:
                if not chunk.text:
                    continue
                raw = chunk.text.strip()
                if not raw:
                    continue
                if raw in seen_output:
                    continue
                if raw.startswith(seen_output):
                    raw = raw[len(seen_output):].strip()
                if seen_output.endswith(raw):
                    continue
                raw = raw.replace(
                "This document does not mention that.",
                "**This document does not mention that.**\n\n"
                )
                if raw:
                    yield raw + " "
                    seen_output += raw + " "
                    await asyncio.sleep(0.01)
        except Exception as e:
            print(f"Chat streaming error: {e}")
            yield "An error occurred during the chat. Please try again."
    return StreamingResponse(generate(), media_type="text/event-stream")
