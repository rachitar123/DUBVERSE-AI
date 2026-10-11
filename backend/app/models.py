from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    plan_tier = Column(String, default="Pro")
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    source_language = Column(String, default="auto")
    target_language = Column(String, nullable=False, default="Hindi")
    voice_id = Column(String, nullable=False, default="wise-cherry-3051__nishanth_anna")
    voice_name = Column(String, default="Nishanth Anna (Hindi Male)")
    
    video_filename = Column(String, nullable=True)
    original_video_url = Column(String, nullable=True)
    output_video_filename = Column(String, nullable=True)
    output_audio_filename = Column(String, nullable=True)
    
    status = Column(String, default="QUEUED")
    progress = Column(Integer, default=0)
    current_step = Column(String, default="Queued for processing")
    estimated_time_remaining = Column(Integer, default=120)
    duration_seconds = Column(Float, default=0.0)
    segments_count = Column(Integer, default=0)
    
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="projects")
    segments = relationship("TranscriptSegment", back_populates="project", cascade="all, delete-orphan", order_by="TranscriptSegment.segment_index")

class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    segment_index = Column(Integer, nullable=False)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    original_text = Column(Text, nullable=False)
    translated_text = Column(Text, nullable=False)
    speaker = Column(String, default="Speaker 1")

    project = relationship("Project", back_populates="segments")

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    default_target_lang = Column(String, default="Hindi")
    default_voice_id = Column(String, default="wise-cherry-3051__nishanth_anna")
    
    # Provider Keys
    openai_api_key = Column(String, nullable=True)
    gemini_api_key = Column(String, nullable=True)
    elevenlabs_api_key = Column(String, nullable=True)
    inworld_api_key = Column(String, nullable=True)
    deepgram_api_key = Column(String, nullable=True)

    auto_sync = Column(String, default="true")
    user = relationship("User", back_populates="settings")
