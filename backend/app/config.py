import os
from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DeepFaceSwap AI"

    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:5173",  # Frontend default dev server
        "http://localhost:3000",
        "http://localhost:8000",
        "https://localhost",
        "https://localhost:5173",
        "https://localhost:3000",
        "https://localhost:8000",
    ]

    # File Storage
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    RESULTS_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "results")

    # AI Model Settings
    MODEL_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
    FACE_DETECTOR: str = "buffalo_l"  # Changed from retinaface_r50_v1 to buffalo_l
    FACE_SWAPPER: str = "buffalo_l"

    # Redis and Celery Settings
    REDIS_HOST: str = os.environ.get("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.environ.get("REDIS_PORT", 6379))
    CELERY_BROKER_URL: str = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"
    CELERY_RESULT_BACKEND: str = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"

    # PostgreSQL Settings (optional)
    POSTGRES_SERVER: Optional[str] = "localhost"
    POSTGRES_USER: Optional[str] = "postgres"
    POSTGRES_PASSWORD: Optional[str] = "postgres"
    POSTGRES_DB: Optional[str] = "deepfaceswap"

    # MongoDB settings
    MONGODB_URL: str = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.environ.get("MONGODB_DB_NAME", "faceswap_db")

    # Performance Settings
    USE_GPU: bool = False  # Changed from True to False
    BATCH_SIZE: int = 4  # For video processing

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Security
    SECRET_KEY: str = "YOUR_SECURE_SECRET_KEY_HERE"  # Change in production!
    
    # JWT Authentication
    JWT_SECRET_KEY: str = os.environ.get("JWT_SECRET_KEY", "JWT_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        case_sensitive = True

# Create settings instance
settings = Settings()

# Create directories if they don't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.RESULTS_DIR, exist_ok=True)
os.makedirs(settings.MODEL_DIR, exist_ok=True)
