from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine, Base, SessionLocal
from app.config import UPLOADS_DIR, OUTPUTS_DIR
from app.routers import auth, projects, voices, analytics, chatbot
from app.models import User, UserSettings, Project, TranscriptSegment
from app.auth import hash_password

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DubVerse AI Platform API",
    description="Enterprise AI Video Dubbing & Voice Cloning SaaS Backend",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads and generated output media
app.mount("/storage/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
app.mount("/storage/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")

# Include Routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(voices.router)
app.include_router(analytics.router)
app.include_router(chatbot.router)

@app.on_event("startup")
def seed_demo_data():
    db = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.email == "demo@dubverse.ai").first()
        if not demo_user:
            user = User(
                email="demo@dubverse.ai",
                hashed_password=hash_password("password123"),
                full_name="Alex Mercer",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                plan_tier="Enterprise"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            settings = UserSettings(user_id=user.id)
            db.add(settings)

            # Add sample project
            demo_project = Project(
                user_id=user.id,
                title="AI Keynote Speech - Multilingual Dub",
                source_language="English",
                target_language="Hindi",
                voice_id="wise-cherry-3051__nishanth_anna",
                voice_name="Nishanth Anna (Hindi Male)",
                original_video_url="https://www.youtube.com/watch?v=Im5BXp8xA0c",
                status="COMPLETED",
                progress=100,
                current_step="Dubbing pipeline successfully completed!",
                estimated_time_remaining=0,
                duration_seconds=220.0,
                segments_count=4
            )
            db.add(demo_project)
            db.commit()
            db.refresh(demo_project)

            # Sample transcript segments
            segments = [
                {"idx": 0, "start": 0.0, "end": 4.5, "orig": "Welcome to the next generation of artificial intelligence dubbing.", "trans": "कृत्रिम बुद्धिमत्ता डबिंग की अगली पीढ़ी में आपका स्वागत है।"},
                {"idx": 1, "start": 4.5, "end": 10.2, "orig": "Our system preserves voice tone, emotion, and synchronizes lip timing.", "trans": "हमारी प्रणाली आवाज के लहजे, भावना को सुरक्षित रखती है और होंठों के समय को सिंक्रोनाइज करती है।"},
                {"idx": 2, "start": 10.2, "end": 16.0, "orig": "You can export high definition video with embedded subtitles in minutes.", "trans": "आप मिनटों में एम्बेडेड सबटाइटल्स के साथ उच्च परिभाषा वीडियो निर्यात कर सकते हैं।"},
                {"idx": 3, "start": 16.0, "end": 22.0, "orig": "Thank you for creating with DubVerse AI.", "trans": "डबवर्स एआई के साथ निर्माण करने के लिए धन्यवाद।"}
            ]

            for s in segments:
                t_seg = TranscriptSegment(
                    project_id=demo_project.id,
                    segment_index=s["idx"],
                    start_time=s["start"],
                    end_time=s["end"],
                    original_text=s["orig"],
                    translated_text=s["trans"]
                )
                db.add(t_seg)
            db.commit()
    finally:
        db.close()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "DubVerse AI Backend", "version": "1.0.0"}
