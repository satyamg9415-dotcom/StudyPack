import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Locate and load the backend/.env file explicitly
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)


class Settings:
    PROJECT_NAME: str = "StudyPack AI Backend"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "25"))
    MAX_UPLOAD_SIZE_BYTES: int = MAX_UPLOAD_SIZE_MB * 1024 * 1024

    # Gemini API Settings (Read strictly from backend .env)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite").strip()

    # CORS Configuration
    CORS_ORIGINS_RAW: str = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    )

    @property
    def is_gemini_configured(self) -> bool:
        """Checks if a non-placeholder Gemini API key is present."""
        return bool(
            self.GEMINI_API_KEY
            and self.GEMINI_API_KEY != "your_gemini_api_key_here"
        )

    @property
    def cors_origins(self) -> List[str]:
        return [
            origin.strip()
            for origin in self.CORS_ORIGINS_RAW.split(",")
            if origin.strip()
        ]


settings = Settings()
