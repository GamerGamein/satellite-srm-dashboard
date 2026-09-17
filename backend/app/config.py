import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in current directory or parent directories
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    PROJECT_NAME: str = "SEN2NEON Satellite SRM Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # MongoDB Settings
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "sen2neon_db")
    MONGODB_COLLECTION: str = os.getenv("MONGODB_COLLECTION", "records")

    # Server Settings
    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))

    # CORS Settings
    ALLOWED_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"
        ).split(",")
        if origin.strip()
    ] + ["*"]

settings = Settings()
