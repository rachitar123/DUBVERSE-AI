from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    plan_tier: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Transcript Segment Schemas
class TranscriptSegmentBase(BaseModel):
    segment_index: int
    start_time: float
    end_time: float
    original_text: str
    translated_text: str
    speaker: Optional[str] = "Speaker 1"

class TranscriptSegmentUpdate(BaseModel):
    translated_text: Optional[str] = None
    original_text: Optional[str] = None

class TranscriptSegmentResponse(TranscriptSegmentBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

# Project Schemas
class ProjectCreate(BaseModel):
    title: str
    source_language: Optional[str] = "auto"
    target_language: str = "Hindi"
    voice_id: str = "wise-cherry-3051__nishanth_anna"
    voice_name: Optional[str] = "Nishanth Anna (Hindi Male)"
    youtube_url: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    user_id: int
    title: str
    source_language: str
    target_language: str
    voice_id: str
    voice_name: str
    video_filename: Optional[str] = None
    original_video_url: Optional[str] = None
    output_video_filename: Optional[str] = None
    output_audio_filename: Optional[str] = None
    status: str
    progress: int
    current_step: str
    estimated_time_remaining: int
    duration_seconds: float
    segments_count: int
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProjectDetailResponse(ProjectResponse):
    segments: List[TranscriptSegmentResponse] = []

# Analytics & Settings Schemas
class AnalyticsResponse(BaseModel):
    total_projects: int
    completed_projects: int
    processing_projects: int
    total_minutes_dubbed: float
    languages_breakdown: Dict[str, int]
    success_rate: float
    recent_activity: List[Dict[str, Any]]

class UserSettingsResponse(BaseModel):
    default_target_lang: str
    default_voice_id: str
    auto_sync: str
    
    # Masked Key Statuses for Privacy & Security
    has_openai_key: bool
    has_gemini_key: bool
    has_elevenlabs_key: bool
    has_inworld_key: bool
    has_deepgram_key: bool
    
    openai_key_masked: str
    gemini_key_masked: str
    elevenlabs_key_masked: str
    inworld_key_masked: str

class UserSettingsUpdate(BaseModel):
    default_target_lang: Optional[str] = None
    default_voice_id: Optional[str] = None
    auto_sync: Optional[str] = None
    
    openai_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    elevenlabs_api_key: Optional[str] = None
    inworld_api_key: Optional[str] = None
    deepgram_api_key: Optional[str] = None
