import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "temporarysecretkey")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 días
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/projectmanager"
    )
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Configuración CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://frontend:3000"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()