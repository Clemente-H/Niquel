import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "temporarysecretkey")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/projectmanager",  # noqa: E501
    )
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # CORS Config
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://frontend:3000",
    ]  # noqa: E501

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
