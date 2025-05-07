import os
import cv2
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import settings
from .routes import swap, live
from .routes.auth import auth_router, user_router
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from mangum import Mangum
from .models.users.database import user_db_service

# Setup rate limiting
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for real-time face swapping and video deepfakes",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Add rate limit error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    swap.router,
    prefix=settings.API_V1_STR,
    tags=["Face Swap"]
)

app.include_router(
    live.router,
    prefix=settings.API_V1_STR,
    tags=["Real-Time Face Swap"]
)

# Include authentication routers
app.include_router(
    auth_router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentication"]
)

app.include_router(
    user_router,
    prefix=f"{settings.API_V1_STR}/users",
    tags=["Users"]
)

# Add Mangum handler for AWS Lambda deployment (optional)
handler = Mangum(app)

@app.on_event("startup")
async def startup_db_client():
    """Initialize MongoDB connection on startup."""
    await user_db_service.initialize()

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown."""
    await user_db_service.close_connection()

@app.get("/")
async def root():
    return {"message": "DeepFaceSwap AI API is running", "docs": "/api/docs"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

# Import this at the end to avoid circular imports
from .models.face_detection import face_detector
from .models.face_swap import face_swap_engine

# Preload models
try:
    face_detector.initialize()
    face_swap_engine.initialize()
except Exception as e:
    print(f"Warning: Failed to preload models: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
