import os
from pydantic import BaseModel


class Settings(BaseModel):
    PORT: int = int(os.getenv("PORT", "8000"))
    AI_SERVICE_SECRET: str = os.getenv("AI_SERVICE_SECRET", "change-me")
    VISION_API_KEY: str = os.getenv("VISION_API_KEY", "")
    VISION_MODEL: str = os.getenv("VISION_MODEL", "gemini-1.5-flash")


settings = Settings()
