import base64
import vertexai
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from fastapi.responses import StreamingResponse
import asyncio

from vertexai.generative_models import GenerativeModel, Part

# --- Pydantic Models ---
class AnalysisRequest(BaseModel):
    document: str
    language: str

class ImageRequest(BaseModel):
    image_data: str

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

# Using a more capable model for better legal analysis and structured output
model = GenerativeModel("gemini-2.5-flash")

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "LegalEase AI Backend is running"}

@app.post("/analyze-text-stream")
async def analyze_document_stream(request: AnalysisRequest):
    """Analyzes text and streams a structured markdown summary back."""
    async def generate():
        try:
            # Updated prompt to include the green emoji for safe clauses
            prompt = f"""
            Act as a legal expert. Analyze the following document and provide a clear, simple, and practical summary in {request.language}.
            Your response must be in Markdown format and strictly follow this structure:

            First, provide a section titled "### Summary".
            This section should give a high-level overview of the document's purpose.

            Second, provide a section titled "### Key Clauses Explained".
            Under this, list each important clause. For each clause:
            - Start the line with a `*`.
            - Use a 🔴 emoji to flag a high-risk clause.
            - Use a 🟡 emoji to flag an important obligation or a medium-risk clause.
            - Use a 🟢 emoji to flag a standard or safe clause.
            - Make the clause title bold (e.g., **Termination Clause**).
            - After the title, provide a simple explanation of what it means for the user.

            Third, provide a section titled "### AI Legal Advice".
            Under this, give practical, actionable advice. Offer suggestions or points the user should consider before signing or acting on the document. This should be a bulleted list.

            Example format:
            ### Summary
            This is a summary of the document...

            ### Key Clauses Explained
            * 🔴 **Indemnification Clause:** This means you are responsible for...
            * 🟡 **Governing Law:** This means the agreement is subject to the laws of...
            * 🟢 **Confidentiality:** This is a standard clause protecting shared information.

            ### AI Legal Advice
            * We recommend you clarify the scope of the indemnification clause with the other party.
            * Consider consulting a local lawyer about the implications of the governing law.

            Do not use any other formatting or add extra text before the first heading.

            Document:
            ---
            {request.document}
            ---
            """
            stream = model.generate_content(prompt, stream=True)
            for chunk in stream:
                # Ensure we are only sending text if it exists.
                if chunk.text:
                    yield chunk.text
                    await asyncio.sleep(0.01)
        except Exception as e:
            print(f"Streaming analysis error: {e}")
            yield "An error occurred during analysis."

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.post("/extract-text-from-image")
async def extract_text_from_image(request: ImageRequest):
    """Extracts text from a base64 encoded image."""
    try:
        image_bytes = base64.b64decode(request.image_data)

        # Basic MIME type detection
        mime_type = "image/jpeg" # Default
        if image_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
            mime_type = "image/png"
        elif image_bytes.startswith(b'GIF87a') or image_bytes.startswith(b'GIF89a'):
            mime_type = "image/gif"
        elif image_bytes.startswith(b'\xff\xd8\xff'):
             mime_type = "image/jpeg"


        image_part = Part.from_data(data=image_bytes, mime_type=mime_type)
        prompt_parts = [image_part, "Extract all text from this image. Only return the extracted text. Do not add any formatting or commentary."]

        response = model.generate_content(prompt_parts)
        return {"text": response.text}
    except Exception as e:
        print(f"An error occurred with image text extraction: {e}")
        raise HTTPException(status_code=500, detail=f"Error extracting text from image: {e}")