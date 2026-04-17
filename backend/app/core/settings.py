from pydantic import SecretStr
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Streamer"
    FRONTEND_URL: str = "http://localhost:5173"

    # API
    API_PREFIX: str = "/api/v1"

    # MongoDB
    MONGODB_URI: SecretStr
    DATABASE_NAME: str = "streamer"

    # JWT
    JWT_SECRET: SecretStr
    JWT_REFRESH_SECRET: SecretStr
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # TMDB
    TMDB_API_KEY: SecretStr
    TMDB_BASE_URL: str = "https://api.themoviedb.org/3"

    # Invite Code
    INVITE_CODE: str = "streamer2026"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    # SMTP
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: SecretStr = SecretStr("")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
