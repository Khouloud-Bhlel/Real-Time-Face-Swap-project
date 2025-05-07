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
    echo "Redis is not running. Please start Redis with: sudo service redis-server start"
    echo "Or install Redis if not installed: sudo apt install redis-server"
    exit 1
fi

# Start services in separate terminals
echo "Starting FastAPI server..."
gnome-terminal -- bash -c "source venv/bin/activate && python run.py; exec bash"

echo "Starting Celery worker..."
gnome-terminal -- bash -c "source venv/bin/activate && celery -A celery_app worker --loglevel=info; exec bash"

echo "Starting Celery beat (scheduler)..."
gnome-terminal -- bash -c "source venv/bin/activate && celery -A celery_app beat --loglevel=info; exec bash"

echo "All services started! FastAPI server is available at http://localhost:8000"
echo "API Documentation: http://localhost:8000/api/docs"
