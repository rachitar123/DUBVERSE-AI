import os
from pathlib import Path
from dotenv import load_dotenv

# Base Directory paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / "backend" / ".env"

if ENV_FILE.exists():
    load_dotenv(dotenv_path=ENV_FILE, override=True)
else:
    load_dotenv(override=True)

# 1. Database & Security Configurations
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/storage/dubbing_saas.db")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dubverse_ai_super_secret_jwt_key_2026_portfolio_saas")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Backward compatibility aliases
SECRET_KEY = JWT_SECRET_KEY
ALGORITHM = JWT_ALGORITHM

# 2. AI Provider Credentials
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
INWORLD_API_KEY = os.getenv("INWORLD_API_KEY", "").strip()
INWORLD_VOICE_ID = os.getenv("INWORLD_VOICE_ID", "wise-cherry-3051__nishanth_anna").strip()
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "").strip()
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "").strip()

# 3. Storage Folders & Directories
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", str(BASE_DIR / "storage" / "uploads"))
OUTPUT_FOLDER = os.getenv("OUTPUT_FOLDER", str(BASE_DIR / "storage" / "outputs"))

UPLOADS_DIR = Path(UPLOAD_FOLDER)
OUTPUTS_DIR = Path(OUTPUT_FOLDER)

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

# 4. Frontend & CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
