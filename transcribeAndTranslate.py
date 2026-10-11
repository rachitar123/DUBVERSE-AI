import os
import json
import subprocess
import whisper
from openai import OpenAI
import sys

# Ensure backend package can be imported for config values
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))
from app.config import OPENAI_API_KEY

# Initialize OpenAI client with environment variable or explicit check
if not OPENAI_API_KEY:
    print("⚠️ WARNING: OPENAI_API_KEY is not set in backend/.env. GPT reconciliation and translation features require OPENAI_API_KEY or GEMINI_API_KEY.")
    client = None
else:
    client = OpenAI(api_key=OPENAI_API_KEY)

YOUTUBE_URL = "https://www.youtube.com/watch?v=Im5BXp8xA0c"

VIDEO_FILE = "video.mp4"
AUDIO_FILE = "audio.mp3"
WAV_FILE = "audio.wav"
TRANSCRIPT_FILE = "segments.json"
YOUTUBE_CAPTION_FILE = "audio.en.vtt"
OUTPUT_AUDIO = "hindi_dubbed2.mp3"
FINAL_VIDEO = "final_dubbed.mp4"

def download_video(url=YOUTUBE_URL):
    subprocess.run([
        "python", "-m", "yt_dlp", "-f", "mp4", "-o", VIDEO_FILE, url
    ])
    subprocess.run([
        "python", "-m", "yt_dlp", "-x", "--audio-format", "mp3", "-o", AUDIO_FILE, url
    ])

def convert_to_wav():
    subprocess.run([
        "ffmpeg", "-y", "-i", AUDIO_FILE, "-ar", "16000", "-ac", "1", WAV_FILE
    ])

def transcribe():
    model = whisper.load_model("medium")
    result = model.transcribe(WAV_FILE)

    segments = []
    for seg in result["segments"]:
        segments.append({
            "start": seg["start"],
            "end": seg["end"],
            "english": seg["text"],
            "hindi": ""
        })

    with open(TRANSCRIPT_FILE, "w", encoding="utf-8") as f:
        json.dump(segments, f, indent=2, ensure_ascii=False)

    return segments

def ask_gpt_to_reconcile(whisper_text, youtube_text):
    """Sends both transcripts to GPT to get a cleaned version."""
    if not whisper_text.strip(): return youtube_text
    if not youtube_text.strip(): return whisper_text
    if whisper_text.strip().lower() == youtube_text.strip().lower(): return whisper_text

    if not client:
        print("⚠️ OPENAI_API_KEY not configured. Skipping GPT reconciliation.")
        return youtube_text

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": (
                        "You are an expert audio proofreader. Combine messy AI transcripts into a single accurate sentence."
                    )
                },
                {"role": "user", "content": f"Transcript A: {whisper_text}\nTranscript B: {youtube_text}"}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"GPT Merge Error: {e}")
        return youtube_text

def translate(text):
    if not client:
        return f"[Untranslated - OPENAI_API_KEY missing]: {text}"

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Translate English text into natural conversational Hindi."},
                {"role": "user", "content": text}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Translation Error: {e}")
        return text

def translate_segments(segments):
    for seg in segments:
        seg["hindi"] = translate(seg["english"])

    with open(TRANSCRIPT_FILE, "w", encoding="utf-8") as f:
        json.dump(segments, f, indent=2, ensure_ascii=False)

    return segments