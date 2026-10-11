import requests
import base64
import json
import os
import sys

# Ensure backend package can be imported for config values
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))
from app.config import INWORLD_API_KEY, INWORLD_VOICE_ID

API_KEY = INWORLD_API_KEY
VOICE_ID = INWORLD_VOICE_ID

SEGMENTS_FILE = "segments.json"
OUTPUT_DIR = "generated_chunks"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def tts(text, output_path):
    if not API_KEY:
        print("❌ Error: INWORLD_API_KEY is not configured in backend/.env or Settings.")
        return False

    url = "https://api.inworld.ai/tts/v1/voice"

    headers = {
        "Authorization": f"Basic {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "text": text,
        "voice_id": VOICE_ID,
        "model_id": "inworld-tts-2"
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        print("Inworld API Error:", response.status_code, response.text)
        return False

    data = response.json()
    audio_b64 = data.get("audioContent")

    if not audio_b64:
        print("❌ No audioContent found in response")
        return False

    audio_bytes = base64.b64decode(audio_b64.strip())

    with open(output_path, "wb") as f:
        f.write(audio_bytes)
        f.flush()
        os.fsync(f.fileno())

    print("✅ Saved TTS chunk:", output_path, "Size:", len(audio_bytes), "bytes")
    return True

if __name__ == "__main__":
    if os.path.exists(SEGMENTS_FILE):
        with open(SEGMENTS_FILE, "r", encoding="utf-8") as f:
            segments = json.load(f)

        for i, seg in enumerate(segments):
            text = seg.get("hindi", "").strip()
            if text:
                output_file = os.path.join(OUTPUT_DIR, f"chunk_{i}.mp3")
                tts(text, output_file)
    else:
        print(f"File {SEGMENTS_FILE} not found.")