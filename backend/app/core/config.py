import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_PATH = BACKEND_DIR / "airbnb.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Anywherebnb API"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH.as_posix()}")
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://anywherebnb.vercel.app",
    ]

    # Twilio API Configuration
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    TWILIO_VERIFY_SERVICE_SID: str = ""
    TWILIO_EMAIL_FROM: str = "noreply@anywherebnb.com"
    SENDGRID_API_KEY: str = ""
    TWILIO_MOCK_MODE: bool = False

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=str(BACKEND_DIR / ".env"),
        extra="ignore",
    )

settings = Settings()
