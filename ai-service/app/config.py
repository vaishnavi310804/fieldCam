import os
from pathlib import Path
from pydantic import BaseModel

_env_file = Path(__file__).resolve().parent.parent / ".env"
if _env_file.exists():
    with open(_env_file, "r", encoding="utf-8") as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _v = _line.split("=", 1)
                _k = _k.strip()
                _v = _v.strip().strip('"').strip("'")
                if _k not in os.environ:
                    os.environ[_k] = _v


class Settings(BaseModel):
    PORT: int = int(os.getenv("PORT", "8000"))
    AI_SERVICE_SECRET: str = os.getenv("AI_SERVICE_SECRET", "change-me")
    VISION_API_KEY: str = os.getenv("VISION_API_KEY", "")
    VISION_MODEL: str = os.getenv("VISION_MODEL", "gemini-flash-latest")


settings = Settings()
