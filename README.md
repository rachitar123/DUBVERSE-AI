# DubVerse AI - Enterprise AI Video Dubbing & Voice Cloning SaaS Platform

**DubVerse AI** is a portfolio-quality AI video dubbing SaaS platform featuring automated speech recognition, LLM contextual translation with multi-provider fallbacks, neural voice cloning, FFmpeg clip retiming, and interactive studio transcript editing.

---

## 🛠️ Technology Stack

- **Backend**: FastAPI (Python 3.10+), SQLAlchemy, Pydantic v2, PyJWT, Passlib
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Lucide Icons, Recharts
- **Database**: SQLite (Production-ready & easily swappable to PostgreSQL)
- **Task Processing**: Async Task Queue & Worker Thread Pool
- **Storage**: Media Uploads (`storage/uploads`) & Outputs (`storage/outputs`)

---

## ⚡ Environment Setup & Configuration Guide

### 1. Copy the Environment Template

Create your `backend/.env` file from the provided `backend/.env.example` template:

```bash
cp backend/.env.example backend/.env
```

### 2. Environment Variables Overview

| Variable | Description | Required / Optional | Procurement Link |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | SQLAlchemy database URL (`sqlite:///./storage/dubbing_saas.db` or PostgreSQL) | **Required** | Local SQLite or Cloud DB |
| `JWT_SECRET_KEY` | Secret key used for signing JWT auth tokens | **Required** | Any secure random string |
| `JWT_ALGORITHM` | JWT signing algorithm (default `HS256`) | **Required** | Standard |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time in minutes (default `1440` = 24 hours) | **Required** | Standard |
| `OPENAI_API_KEY` | Primary LLM Translation key (`gpt-4o-mini`) | **Optional** (Fallback to Gemini) | [OpenAI API Keys](https://platform.openai.com/api-keys) |
| `GEMINI_API_KEY` | Fallback LLM Translation key (`gemini-1.5-flash`) | **Optional** (Fallback from OpenAI) | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `ELEVENLABS_API_KEY` | Primary Voice Cloning & Speech Synthesis key | **Optional** (Fallback to Inworld) | [ElevenLabs](https://elevenlabs.io) |
| `INWORLD_API_KEY` | Fallback Voice Cloning API Key | **Optional** (Fallback from ElevenLabs) | [Inworld AI](https://inworld.ai) |
| `INWORLD_VOICE_ID` | Default Inworld voice profile ID | **Optional** | Inworld Studio |
| `DEEPGRAM_API_KEY` | High accuracy speech-to-text API Key | **Optional** | [Deepgram Console](https://console.deepgram.com) |
| `UPLOAD_FOLDER` | Relative path to store uploaded media files | **Required** | Defaults to `./storage/uploads` |
| `OUTPUT_FOLDER` | Relative path to store dubbed media outputs | **Required** | Defaults to `./storage/outputs` |
| `FRONTEND_URL` | Base URL of React Frontend application | **Required** | Defaults to `http://localhost:3000` |

---

## 🚀 Running the Application

### Backend Setup (FastAPI)

```bash
# 1. Create and activate virtual environment
python3 -m venv backend/venv
source backend/venv/bin/pip install -r backend/requirements.txt

# 2. Start FastAPI Server on port 8005
PYTHONPATH=backend backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload
```

### Frontend Setup (React + Vite)

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Launch Dev Server on port 3000
npm run dev -- --port 3000
```

Access the web application at `http://localhost:3000`.

### Demo Login Credentials
- **Email**: `demo@dubverse.ai`
- **Password**: `password123`

---

## 🛡️ Security & Privacy
- **Zero Secrets Hardcoded**: All API keys and secrets are loaded dynamically via `app/config.py` using `python-dotenv`.
- **Masked Keys**: User API key settings are masked in API responses (`sk-proj-••••••••3x9Z`) to prevent secret exposure.
- **Git Protection**: `backend/.env` is listed in `.gitignore` to ensure credentials are never committed.