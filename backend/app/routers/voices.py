
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import requests
from app.config import INWORLD_API_KEY


router = APIRouter(prefix="/api/voices", tags=["Voices"])

SUPPORTED_LANGUAGES = [
    {"code": "hi", "name": "Hindi", "native": "हिन्दी", "flag": "🇮🇳"},
    {"code": "en", "name": "English", "native": "English", "flag": "🇺🇸"},
    {"code": "es", "name": "Spanish", "native": "Español", "flag": "🇪🇸"},
    {"code": "fr", "name": "French", "native": "Français", "flag": "🇫🇷"},
    {"code": "de", "name": "German", "native": "Deutsch", "flag": "🇩🇪"},
    {"code": "ja", "name": "Japanese", "native": "日本語", "flag": "🇯🇵"},
    {"code": "zh", "name": "Mandarin", "native": "中文", "flag": "🇨🇳"},
    {"code": "ar", "name": "Arabic", "native": "العربية", "flag": "🇸🇦"}
]

VOICE_CLONES = [
    
]

@router.get("/languages")
def get_languages() -> List[Dict[str, Any]]:
    return SUPPORTED_LANGUAGES


@router.get("/profiles")
def get_voices():
    try:
        response = requests.get(
            "https://api.inworld.ai/voices/v1/voices",
            headers={
                "Authorization": f"Basic {INWORLD_API_KEY}"
            },
            params={"pageSize": 100},
            timeout=20,
        )
        response.raise_for_status()

        data = response.json()

        return [
            {
                "id": voice["voiceId"],
                "name": voice.get("displayName") or voice["voiceId"],
                "gender": voice.get("gender", ""),
                "language": voice.get("languageCode", ""),
                "description": voice.get("description", ""),
                "is_cloned": voice.get("source") == "IVC",
            }
            for voice in data.get("voices", [])
        ]

    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not retrieve voices from Inworld."
        ) from exc

