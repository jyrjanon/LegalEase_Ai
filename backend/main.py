import base64
import vertexai
import requests
import json
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from google.cloud import texttospeech

from vertexai.generative_models import GenerativeModel, Part, Image

# --- Pydantic Models for Request Bodies ---

class AnalysisRequest(BaseModel):
    document: str
    question: str
    language: str

class UrlRequest(BaseModel):
    url: str

class ImageRequest(BaseModel):
    image_data: str # Base64 encoded image string

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

# Initialize TTS client
tts_client = texttospeech.TextToSpeechClient()

# Use specific models for specific tasks
vision_model = GenerativeModel("gemini-2.5-pro") # For image-based tasks
text_model = GenerativeModel("gemini-2.5-flash") # For text and chat tasks

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "LegalEase AI Backend is running"}

@app.post("/analyze-structured")
async def analyze_document_structured(request: AnalysisRequest):
    """Analyzes the document to extract structured data."""
    try:
        prompt = f"""
        Analyze the following legal document. The user's query is: "{request.question}".
        The desired output language is {request.language}.

        Based on the document, provide a response in a valid JSON format with the following structure:
        {{
          "riskScore": <an integer between 0 and 100, where 100 is highest risk>,
          "obligations": ["<a bullet point summarizing an obligation>", "..."],
          "risks": ["<a bullet point summarizing a risk>", "..."],
          "benefits": ["<a bullet point summarizing a benefit>", "..."]
        }}

        Do not include any text, explanations, or markdown formatting outside of the JSON object.

        Document:
        ---
        {request.document}
        ---
        """
        response = text_model.generate_content(prompt)
        json_response_text = response.text.strip().replace("```json", "").replace("```", "")
        
        try:
            data = json.loads(json_response_text)
            return data
        except json.JSONDecodeError:
            print("Failed to decode JSON from AI response:", json_response_text)
            raise HTTPException(status_code=500, detail="AI returned an invalid data format.")

    except Exception as e:
        print(f"An error occurred with the Vertex AI API: {e}")
        raise HTTPException(status_code=500, detail=f"Error analyzing document: {e}")

@app.post("/compare-documents")
async def compare_documents(request: ComparisonRequest):
    """Compares two documents and highlights the changes."""
    try:
        prompt = f"""
        Act as a legal analyst. Compare Document 1 (Original) and Document 2 (Revised).
        Identify the key additions, removals, and modifications in Document 2.
        For each modification, explain the potential legal implication of the change.
        The desired output language is {request.language}.

        Provide a response in a valid JSON format with the following structure:
        {{
          "added": [
            {{ "clause": "<The full text of the added clause>", "implication": "<The legal implication of this addition>" }}
          ],
          "removed": [
            {{ "clause": "<The full text of the removed clause>", "implication": "<The legal implication of this removal>" }}
          ],
          "modified": [
            {{ "original_clause": "<The text of the clause in Document 1>", "revised_clause": "<The corresponding text in Document 2>", "implication": "<The legal implication of this modification>" }}
          ]
        }}
        
        Do not include any text outside of the JSON object.

        Document 1 (Original):
        ---
        {request.document1}
        ---

        Document 2 (Revised):
        ---
        {request.document2}
        ---
        """
        response = text_model.generate_content(prompt)
        json_response_text = response.text.strip().replace("```json", "").replace("```", "")
        try:
            data = json.loads(json_response_text)
            return data
        except json.JSONDecodeError:
            print("Failed to decode JSON from AI response for comparison:", json_response_text)
            raise HTTPException(status_code=500, detail="AI returned an invalid comparison format.")

    except Exception as e:
        print(f"An error occurred during comparison: {e}")
        raise HTTPException(status_code=500, detail=f"Error comparing documents: {e}")


@app.post("/fetch-text-from-url")
async def fetch_text_from_url(request: UrlRequest):
    """Fetches and extracts the main text content from a given URL."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing URL content: {e}")

@app.post("/extract-text-from-image")
async def extract_text_from_image(request: ImageRequest):
    """Extracts text from a base64 encoded image using OCR."""
    try:
        image_bytes = base64.b64decode(request.image_data)
        
        mime_type = "image/jpeg"
        if image_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
            mime_type = "image/png"

        image_part = Part.from_data(data=image_bytes, mime_type=mime_type)
        prompt_parts = [image_part, "Extract all text from this image. Only return the extracted text."]
        
        response = vision_model.generate_content(prompt_parts)
        return {"text": response.text}
    except Exception as e:
        print(f"An error occurred with image processing: {e}")
        raise HTTPException(status_code=500, detail=f"Error extracting text from image: {e}")


@app.post("/generate-suggestions")
async def generate_suggestions(request: SuggestionRequest):
    """Generates follow-up questions based on the document."""
    try:
        prompt = f"""
        Based on the following legal document, generate 3 concise, insightful follow-up questions a user might ask.
        The output language should be {request.language}.
        Return the questions in a valid JSON format, like this: {{"suggestions": ["question 1", "question 2", "question 3"]}}.
        Do not include any text outside the JSON object.

        Document:
        ---
        {request.document}
        ---
        """
        response = text_model.generate_content(prompt)
        json_response_text = response.text.strip().replace("```json", "").replace("```", "")
        try:
            data = json.loads(json_response_text)
            return data
        except json.JSONDecodeError:
            print("Failed to decode JSON from AI response for suggestions:", json_response_text)
            raise HTTPException(status_code=500, detail="AI returned an invalid data format for suggestions.")
    except Exception as e:
        print(f"An error occurred generating suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate suggestions.")

@app.post("/chat")
async def chat_with_document(request: ChatRequest):
    """Handles conversational chat with the document as context."""
    try:
        system_prompt = (
            "You are an expert AI legal assistant integrated into a tool called LegalEase. "
            "Your primary function is to provide advice, detailed explanations, and assistance based *exclusively* on the legal document provided by the user. "
            f"All your responses must be in {request.language}. "
            "Here are your rules:\n"
            "1. **Anchor all answers to the document:** When the user asks a question, first find the relevant clause or section in the document to base your answer on. If possible, quote the key part of the clause and then explain it in simple terms.\n"
            "2. **Be an advisor, not just an explainer:** Do not just define terms. Explain what the clauses *mean* for the user. For example, if you see a liability clause, explain what the user is responsible for.\n"
            "3. **Stay strictly on topic:** The user's document is your entire world. If a user asks a question that cannot be answered from the document's content (e.g., 'What's the weather like?' or 'What is the capital of France?'), you must politely decline and steer the conversation back to the document. A good response would be, 'I can only provide assistance regarding the legal document you've uploaded. How can I help you with it?'\n"
            "4. **Use the conversation history:** Pay attention to previous questions to understand the context of the user's current query."
        )

        full_prompt_text = system_prompt + "\n\nLEGAL DOCUMENT:\n---\n" + request.document + "\n---\n\nCONVERSATION HISTORY:\n"
        for msg in request.messages:
            role = "User" if msg.role == "user" else "Assistant"
            full_prompt_text += f"{role}: {msg.content}\n"
        full_prompt_text += "Assistant:"
        
        response = text_model.generate_content(full_prompt_text)
        
        return {"response": response.text}

    except Exception as e:
        print(f"An error occurred during chat: {e}")
        raise HTTPException(status_code=500, detail="Failed to get chat response.")


@app.post("/generate-audio-summary")
async def generate_audio_summary(request: AudioRequest):
    """Generates an audio summary of the provided text using Text-to-Speech."""
    try:
        language_code_map = {
            "English": "en-US", "Hindi": "hi-IN", "Gujarati": "gu-IN",
            "Kannada": "kn-IN", "Marathi": "mr-IN", "Tamil": "ta-IN", "Telugu": "te-IN",
        }
        
        # Maps languages to specific, high-quality WaveNet voices for clarity
        voice_name_map = {
            "English": "en-US-Studio-O",
            "Hindi": "hi-IN-Wavenet-D",
            "Gujarati": "gu-IN-Wavenet-A",
            "Kannada": "kn-IN-Wavenet-A", # Specific high-quality voice for Kannada
            "Marathi": "mr-IN-Wavenet-A",
            "Tamil": "ta-IN-Wavenet-A",
            "Telugu": "te-IN-Wavenet-A",
        }

        language_code = language_code_map.get(request.language, "en-US")
        voice_name = voice_name_map.get(request.language, "en-US-Studio-O")

        synthesis_input = texttospeech.SynthesisInput(text=request.text)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code, name=voice_name
        )
        
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=0.9 # Slower speaking rate (0.9 is 10% slower)
        )
        
        response = tts_client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )
        
        audio_content_b64 = base64.b64encode(response.audio_content).decode('utf-8')
        
        return {"audio_content": audio_content_b64}
        
    except Exception as e:
        print(f"An error occurred with Text-to-Speech API: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate audio summary.")

