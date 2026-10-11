
import base64
from pathlib import Path
from typing import Optional

import requests

from app.config import INWORLD_API_KEY, INWORLD_VOICE_ID


class TTSService:
    def __init__(self):
        if not INWORLD_API_KEY:
            raise ValueError("INWORLD_API_KEY is not configured.")

        self.api_key = INWORLD_API_KEY
        self.voice_id = INWORLD_VOICE_ID

    def generate_audio(
        self,
        text: str,
        output_file: Path,
        language: str = "hi-IN",
        voice_id: Optional[str] = None,
    ) -> Path:
        """Generate speech using the selected Inworld voice."""

        output_file.parent.mkdir(parents=True, exist_ok=True)

        url = "https://api.inworld.ai/tts/v1/voice"

        headers = {
            "Authorization": f"Basic {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "text": text,
            "voiceId": voice_id or self.voice_id,
            "modelId": "inworld-tts-2",
            "language": language,
        }

        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=60,
        )
        response.raise_for_status()

        data = response.json()
        audio_b64 = data.get("audioContent")

        if not audio_b64:
            raise RuntimeError(
                "No audioContent returned from Inworld."
            )

        audio_bytes = base64.b64decode(audio_b64)

        with open(output_file, "wb") as audio_file:
            audio_file.write(audio_bytes)

        return output_file

    def generate_segments(
        self,
        segments,
        output_dir: Path,
        target_language: str = "Hindi",
        voice_id: Optional[str] = None,
    ):
        """Generate audio files using the selected voice."""

        language_codes = {
            "Hindi": "hi-IN",
            "English": "en-US",
            "Spanish": "es-ES",
            "French": "fr-FR",
            "German": "de-DE",
            "Japanese": "ja-JP",
            "Mandarin": "zh-CN",
            "Arabic": "ar-SA",
        }

        language_code = language_codes.get(target_language)

        if not language_code:
            raise ValueError(
                f"Unsupported TTS language: {target_language}"
            )

        output_dir.mkdir(parents=True, exist_ok=True)
        generated_files = []

        for index, segment in enumerate(segments):
            text = segment.get("hindi", "").strip()

            if not text:
                continue

            output_file = output_dir / f"chunk_{index}.mp3"

            self.generate_audio(
                text,
                output_file,
                language=language_code,
                voice_id=voice_id,
            )

            generated_files.append(output_file)

        return generated_files
