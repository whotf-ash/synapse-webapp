import os
import asyncio
import uuid
import time
from glob import glob
from dotenv import load_dotenv
import google.generativeai as genai
import edge_tts
import uvicorn
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from fastapi.responses import FileResponse

# --- App Setup ---
app = FastAPI()

# CORS Middleware to allow your frontend to connect
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://synapse-webapp.netlify.app" # Allows your live website to connect
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AI Configuration ---
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")
genai.configure(api_key=api_key)

# --- Pydantic Models ---
class TranslateRequest(BaseModel):
    text: str
    lang_name: str
    voice: str

class ConverseRequest(BaseModel):
    text: str
    lang_name: str
    proficiency: str
    voice: str
    history: List[Dict[str, str]]

# --- Helper Functions ---
def get_conversation_prompt(language_name: str, proficiency: str) -> str:
    prompts = {
        "beginner": (f"You are a native {language_name} speaker. I am a beginner, so use simple vocabulary and short sentences. Do not speak English. Start with a simple greeting."),
        "intermediate": (f"You are a native {language_name} speaker. I am an intermediate learner, so use a normal range of vocabulary. Do not speak English. Start with a greeting and an open-ended question."),
        "advanced": (f"You are a native {language_name} speaker. I am an advanced learner, so speak as you would to a native, using idioms. Do not speak English. Start by introducing a topic.")
    }
    return prompts.get(proficiency, prompts["intermediate"])

async def text_to_speech(text: str, voice: str) -> str | None:
    """Generates a unique filename for the audio and returns it."""
    try:
        unique_filename = f"{uuid.uuid4()}.mp3"
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(unique_filename)
        return unique_filename
    except Exception as e:
        print(f"Error creating speech file: {e}")
        return None

def cleanup_files(filename: str):
    """Deletes the given file after a delay and cleans up other old mp3 files."""
    time.sleep(10) # Wait before deleting to ensure the file has been sent
    try:
        os.remove(filename)
        # Also clean up any other mp3 files older than 5 minutes
        for file in glob("*.mp3"):
            if os.path.getmtime(file) < time.time() - 300:
                os.remove(file)
    except OSError as e:
        print(f"Error during file cleanup: {e}")

# --- API Endpoints ---
@app.get("/")
async def root():
    return {"status": "ok", "message": "Synapse Backend is running."}

@app.post("/api/translate")
async def translate(request: TranslateRequest, background_tasks: BackgroundTasks):
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    prompt = (f"Translate the following English text to {request.lang_name}. Provide only the single, "
              f"most common translation as a plain string, with no extra text or formatting. "
              f"Text to translate: '{request.text}'")
    
    response = model.generate_content(prompt)
    translated_text = response.text.strip()
    
    unique_filename = await text_to_speech(translated_text, request.voice)
    if unique_filename:
        background_tasks.add_task(cleanup_files, unique_filename) # Schedule cleanup
        return {"text": translated_text, "audio_url": f"/audio/{unique_filename}"}
    else:
        return {"error": "Failed to generate audio"}, 500

@app.post("/api/converse")
async def converse(request: ConverseRequest, background_tasks: BackgroundTasks):
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    
    formatted_history = [{'role': p['role'], 'parts': [p['parts']]} for p in request.history]
    
    if not formatted_history:
        system_prompt = get_conversation_prompt(request.lang_name, request.proficiency)
        chat = model.start_chat(history=[
            {'role': 'user', 'parts': [system_prompt]},
            {'role': 'model', 'parts': [" "]}
        ])
        response = chat.send_message("Please begin the conversation.")
    else:
        chat = model.start_chat(history=formatted_history)
        response = chat.send_message(request.text)

    ai_text = response.text.strip()
    
    unique_filename = await text_to_speech(ai_text, request.voice)
    if unique_filename:
        background_tasks.add_task(cleanup_files, unique_filename) # Schedule cleanup
        new_history = [{'role': p.role, 'parts': p.parts[0].text} for p in chat.history]
        return {"text": ai_text, "audio_url": f"/audio/{unique_filename}", "history": new_history}
    else:
        return {"error": "Failed to generate audio"}, 500

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    # Basic security check
    if ".." in filename or not filename.endswith(".mp3"):
        return {"error": "Invalid filename"}, 400
    return FileResponse(path=filename, media_type="audio/mpeg", filename=filename)

# --- To Run the Server ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)