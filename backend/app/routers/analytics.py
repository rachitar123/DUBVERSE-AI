from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Project, UserSettings
from app.schemas import AnalyticsResponse, UserSettingsResponse, UserSettingsUpdate
from app.auth import get_current_user
from app.config import (
    OPENAI_API_KEY, GEMINI_API_KEY, ELEVENLABS_API_KEY, INWORLD_API_KEY, DEEPGRAM_API_KEY
)

router = APIRouter(prefix="/api", tags=["Analytics & Settings"])

def mask_key(key: str) -> str:
    if not key:
        return ""
    if len(key) <= 8:
        return "••••••••"
    return f"{key[:4]}••••••••{key[-4:]}"

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()

    total_projects = len(projects)
    completed_projects = sum(1 for p in projects if p.status == "COMPLETED")
    processing_projects = sum(1 for p in projects if p.status in ["QUEUED", "EXTRACTING", "TRANSCRIBING", "TRANSLATING", "SYNTHESIZING", "SYNCING"])
    total_minutes = sum((p.duration_seconds or 0) for p in projects if p.status == "COMPLETED") / 60.0

    lang_counts = {}
    for p in projects:
        lang_counts[p.target_language] = lang_counts.get(p.target_language, 0) + 1

    success_rate = (completed_projects / total_projects * 100.0) if total_projects > 0 else 100.0

    recent_activity = [
        {
            "id": p.id,
            "title": p.title,
            "target_language": p.target_language,
            "status": p.status,
            "progress": p.progress,
            "created_at": p.created_at.isoformat()
        }
        for p in projects[:5]
    ]

    return {
        "total_projects": total_projects,
        "completed_projects": completed_projects,
        "processing_projects": processing_projects,
        "total_minutes_dubbed": round(total_minutes, 1),
        "languages_breakdown": lang_counts if lang_counts else {"Hindi": 1},
        "success_rate": round(success_rate, 1),
        "recent_activity": recent_activity
    }

@router.get("/settings", response_model=UserSettingsResponse)
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    # Determine key priority (DB Setting > Environment Config)
    openai_k = settings.openai_api_key or OPENAI_API_KEY
    gemini_k = settings.gemini_api_key or GEMINI_API_KEY
    elevenlabs_k = settings.elevenlabs_api_key or ELEVENLABS_API_KEY
    inworld_k = settings.inworld_api_key or INWORLD_API_KEY
    deepgram_k = settings.deepgram_api_key or DEEPGRAM_API_KEY

    return {
        "default_target_lang": settings.default_target_lang or "Hindi",
        "default_voice_id": settings.default_voice_id or "wise-cherry-3051__nishanth_anna",
        "auto_sync": settings.auto_sync or "true",
        
        "has_openai_key": bool(openai_k),
        "has_gemini_key": bool(gemini_k),
        "has_elevenlabs_key": bool(elevenlabs_k),
        "has_inworld_key": bool(inworld_k),
        "has_deepgram_key": bool(deepgram_k),

        "openai_key_masked": mask_key(openai_k),
        "gemini_key_masked": mask_key(gemini_k),
        "elevenlabs_key_masked": mask_key(elevenlabs_k),
        "inworld_key_masked": mask_key(inworld_k)
    }

@router.put("/settings", response_model=UserSettingsResponse)
def update_settings(
    settings_in: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    if settings_in.default_target_lang is not None:
        settings.default_target_lang = settings_in.default_target_lang
    if settings_in.default_voice_id is not None:
        settings.default_voice_id = settings_in.default_voice_id
    if settings_in.auto_sync is not None:
        settings.auto_sync = settings_in.auto_sync

    if settings_in.openai_api_key is not None:
        settings.openai_api_key = settings_in.openai_api_key.strip()
    if settings_in.gemini_api_key is not None:
        settings.gemini_api_key = settings_in.gemini_api_key.strip()
    if settings_in.elevenlabs_api_key is not None:
        settings.elevenlabs_api_key = settings_in.elevenlabs_api_key.strip()
    if settings_in.inworld_api_key is not None:
        settings.inworld_api_key = settings_in.inworld_api_key.strip()
    if settings_in.deepgram_api_key is not None:
        settings.deepgram_api_key = settings_in.deepgram_api_key.strip()

    db.commit()
    db.refresh(settings)

    openai_k = settings.openai_api_key or OPENAI_API_KEY
    gemini_k = settings.gemini_api_key or GEMINI_API_KEY
    elevenlabs_k = settings.elevenlabs_api_key or ELEVENLABS_API_KEY
    inworld_k = settings.inworld_api_key or INWORLD_API_KEY
    deepgram_k = settings.deepgram_api_key or DEEPGRAM_API_KEY

    return {
        "default_target_lang": settings.default_target_lang or "Hindi",
        "default_voice_id": settings.default_voice_id or "wise-cherry-3051__nishanth_anna",
        "auto_sync": settings.auto_sync or "true",
        
        "has_openai_key": bool(openai_k),
        "has_gemini_key": bool(gemini_k),
        "has_elevenlabs_key": bool(elevenlabs_k),
        "has_inworld_key": bool(inworld_k),
        "has_deepgram_key": bool(deepgram_k),

        "openai_key_masked": mask_key(openai_k),
        "gemini_key_masked": mask_key(gemini_k),
        "elevenlabs_key_masked": mask_key(elevenlabs_k),
        "inworld_key_masked": mask_key(inworld_k)
    }
