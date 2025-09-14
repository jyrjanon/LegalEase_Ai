import base64
import vertexai
import requests
import json
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from google.cloud import texttospeech
from fastapi.responses import StreamingResponse
import asyncio

from vertexai.generative_models import GenerativeModel, Part, Image

# --- Pydantic Models for Request Bodies ---

class AnalysisRequest(BaseModel):
    document: str
    question: str
    language: str

class UrlRequest(BaseModel):
    url: str

class ImageRequest(BaseModel):
    image_data: str 

class SuggestionRequest(BaseModel):
    document: str
    language: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    document: str
    messages: List[ChatMessage]
    language: str

class ComparisonRequest(BaseModel):
    document1: str
    document2: str
    language: str

class AudioRequest(BaseModel):
    text: str
    language: str

# --- FastAPI App Initialization ---

app = FastAPI()

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Vertex AI & TTS Initialization ---
PROJECT_ID = "genai-471305"
LOCATION = "us-central1"
vertexai.init(project=PROJECT_ID, location=LOCATION)

tts_client = texttospeech.TextToSpeechClient()
text_model = GenerativeModel("gemini-2.5-flash")

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "LegalEase AI Backend is running"}

@app.post("/analyze-structured-stream")
async def analyze_document_stream(request: AnalysisRequest):
    """Analyzes the document and streams the structured data back."""
    async def generate():
        try:
            prompt = f"""
            Analyze the following legal document based on the user's query: "{request.question}".
            The response must be in {request.language}.
            Provide a response in a single, valid JSON format with this exact structure:
            {{
              "riskScore": <integer from 0 to 100>,
              "obligations": ["<summary of an obligation>", "..."],
              "risks": ["<summary of a risk>", "..."],
              "benefits": ["<summary of a benefit>", "..."]
            }}
            Do not include any text or markdown formatting outside of the JSON object.

            Document:
            ---
            {request.document}
            ---
            """
            stream = text_model.generate_content(prompt, stream=True)
            for chunk in stream:
                yield chunk.text
                await asyncio.sleep(0.01)
        except Exception as e:
            print(f"Streaming analysis error: {e}")
            yield json.dumps({"error": "Failed to stream analysis."})

    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/compare-documents")
async def compare_documents(request: ComparisonRequest):
    """Compares two documents and highlights the changes."""
    try:
        prompt = f"""
        Act as a legal analyst. Compare Document 1 (Original) and Document 2 (Revised).
        Identify the key additions, removals, and modifications in Document 2.
        For each, explain the legal implication. The language should be {request.language}.
        Provide a response in a valid JSON format:
        {{
          "added": [{{ "clause": "<added clause>", "implication": "<implication>" }}],
          "removed": [{{ "clause": "<removed clause>", "implication": "<implication>" }}],
          "modified": [{{ "original_clause": "<original>", "revised_clause": "<revised>", "implication": "<implication>" }}]
        }}
        
        Document 1 (Original): --- {request.document1} ---
        Document 2 (Revised): --- {request.document2} ---
        """
        response = text_model.generate_content(prompt)
        json_response_text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(json_response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/fetch-text-from-url")
async def fetch_text_from_url(request: UrlRequest):
    """Fetches and extracts text content from a URL."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(request.url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        for script_or_style in soup(["script", "style"]):
            script_or_style.decompose()
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        cleaned_text = '\n'.join(chunk for chunk in chunks if chunk)
        return {"text": cleaned_text}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {e}")

@app.post("/extract-text-from-image")
async def extract_text_from_image(request: ImageRequest):
    """Extracts text from a base64 encoded image."""
    try:
        image_bytes = base64.b64decode(request.image_data)
        image_part = Part.from_data(data=image_bytes, mime_type="image/png")
        prompt_parts = [image_part, "Extract all text from this image. Only return the extracted text."]
        model = GenerativeModel("gemini-2.5-pro")
        response = model.generate_content(prompt_parts)
        return {"text": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-suggestions")
async def generate_suggestions(request: SuggestionRequest):
    """Generates follow-up questions."""
    try:
        prompt = f"""
        Based on the legal document, generate 3 concise follow-up questions a user might ask.
        The language should be {request.language}.
        Return a valid JSON: {{"suggestions": ["question 1", "question 2", "question 3"]}}.
        
        Document: --- {request.document} ---
        """
        response = text_model.generate_content(prompt)
        json_response_text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(json_response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate suggestions.")

@app.post("/chat-stream")
async def chat_with_document_stream(request: ChatRequest):
    """Handles conversational chat with a streaming response."""
    async def generate_chat_response():
        try:
            system_prompt = (
                 "You are an expert AI legal assistant, LegalEase. Your role is to provide advice and explanations based *exclusively* on the provided legal document. "
                f"All responses must be in {request.language}. "
                "Rules:\n"
                "1. **Anchor answers to the document:** Base your answers on the provided text. Quote key parts and explain them simply.\n"
                "2. **Be an advisor:** Explain what clauses mean for the user, not just what they are.\n"
                "3. **Stay on topic:** If a question is unrelated to the document, politely decline and steer back to it. Example: 'I can only help with the document you've provided. How can I assist with it?'\n"
                "4. **Use conversation history:** Understand the context of the user's current query from past messages."
            )

            full_prompt_text = system_prompt + "\n\nLEGAL DOCUMENT:\n---\n" + request.document + "\n---\n\nCONVERSATION HISTORY:\n"
            for msg in request.messages:
                role = "User" if msg.role == "user" else "Assistant"
                full_prompt_text += f"{role}: {msg.content}\n"
            full_prompt_text += "Assistant:"
            
            stream = text_model.generate_content(full_prompt_text, stream=True)
            
            for chunk in stream:
                yield chunk.text
                await asyncio.sleep(0.01)

        except Exception as e:
            print(f"Chat streaming error: {e}")
            yield "Sorry, I encountered an error. Please try again."

    return StreamingResponse(generate_chat_response(), media_type="text/event-stream")


@app.post("/generate-audio-summary")
async def generate_audio_summary(request: AudioRequest):
    """Generates an audio summary using Text-to-Speech."""
    try:
        language_code_map = {
            "English": "en-US", "Hindi": "hi-IN", "Gujarati": "gu-IN",
            "Kannada": "kn-IN", "Marathi": "mr-IN", "Tamil": "ta-IN", "Telugu": "te-IN",
        }
        
        voice_name_map = {
            "English": "en-US-Studio-O", "Hindi": "hi-IN-Wavenet-D",
            "Gujarati": "gu-IN-Wavenet-A", "Kannada": "kn-IN-Wavenet-A",
            "Marathi": "mr-IN-Wavenet-A", "Tamil": "ta-IN-Wavenet-A", "Telugu": "te-IN-Wavenet-A",
        }

        language_code = language_code_map.get(request.language, "en-US")
        voice_name = voice_name_map.get(request.language, "en-US-Studio-O")

        synthesis_input = texttospeech.SynthesisInput(text=request.text)
        voice = texttospeech.VoiceSelectionParams(language_code=language_code, name=voice_name)
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=0.9
        )
        
        response = tts_client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)
        audio_content_b64 = base64.b64encode(response.audio_content).decode('utf-8')
        
        return {"audio_content": audio_content_b64}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

