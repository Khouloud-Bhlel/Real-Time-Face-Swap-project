#!/bin/bash

# Start Backend Services for DeepFaceSwap AI
echo "Starting DeepFaceSwap AI Backend Services..."

# Ensure virtual environment is activated
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements if needed
echo "Installing requirements..."
pip install -r requirements.txt

# Create necessary directories
mkdir -p uploads results models

# Check if Redis is running
redis_running=$(pgrep redis-server)
if [ -z "$redis_running" ]; then
    echo "Redis is not running. Starting Redis..."
    # Try to start Redis
    if command -v redis-server &> /dev/null; then
        redis-server --daemonize yes
    else
        echo "Redis is not installed or not in PATH. Please install Redis with: sudo apt install redis-server"
        echo "Then start Redis with: sudo service redis-server start"
        exit 1
    fi
fi

# Start services in background
echo "Starting FastAPI server..."
source venv/bin/activate && python run.py > fastapi.log 2>&1 &
FASTAPI_PID=$!
echo "FastAPI server started with PID: $FASTAPI_PID"

echo "Starting Celery worker..."
source venv/bin/activate && celery -A celery_app worker --loglevel=info > celery_worker.log 2>&1 &
CELERY_WORKER_PID=$!
echo "Celery worker started with PID: $CELERY_WORKER_PID"

echo "Starting Celery beat (scheduler)..."
source venv/bin/activate && celery -A celery_app beat --loglevel=info > celery_beat.log 2>&1 &
CELERY_BEAT_PID=$!
echo "Celery beat started with PID: $CELERY_BEAT_PID"

echo "All services started! FastAPI server is available at http://localhost:8000"
echo "API Documentation: http://localhost:8000/api/docs"
echo
echo "Services are running in the background. Check log files for details:"
echo "- FastAPI: fastapi.log"
echo "- Celery worker: celery_worker.log"
echo "- Celery beat: celery_beat.log"
echo
echo "To stop services, use: kill $FASTAPI_PID $CELERY_WORKER_PID $CELERY_BEAT_PID"
