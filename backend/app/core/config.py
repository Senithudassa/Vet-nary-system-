import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Application Config
    ENV: str = "development"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str

    # Supabase Config
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # AI Config
    AI_MODEL_API_KEY: str
    AI_RATE_LIMIT_PER_MIN: int = 5

    # Core Settings setup to pull from .env automatically
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        case_sensitive=True,
        extra="ignore"
    )

# Instantiate a global settings object
settings = Settings()
