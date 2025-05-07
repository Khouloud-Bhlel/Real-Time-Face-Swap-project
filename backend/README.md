# DeepFaceSwap AI Backend

This is the backend service for the DeepFaceSwap AI project, providing real-time face swapping and video deepfake generation APIs.

## Features

- **Image Face Swap**: Swap faces between two static images
- **Video Deepfake**: Swap faces in a full video with asynchronous processing
- **Live Face Swap**: Real-time face swapping via WebSockets for webcam integration
- **Task Queue**: Background processing of intensive tasks using Celery

## Setup and Installation

### Prerequisites
- Python 3.9+
- Redis Server (for Celery task queue)
- FFmpeg (for video processing)

### Using Virtual Environment

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   ```bash
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Install Redis server:
   ```bash
   # Ubuntu/Debian
   sudo apt install redis-server

   # Start Redis service
   sudo service redis-server start
   ```

### Running the Services

You can use the provided startup script:

```bash
./start_services.sh
```

Or manually start each component:

1. Start the FastAPI server:
   ```bash
   python run.py
   ```

2. Start Celery worker (in a separate terminal):
   ```bash
   celery -A celery_app worker --loglevel=info
   ```

3. Start Celery beat scheduler (in a separate terminal):
   ```bash
   celery -A celery_app beat --loglevel=info
   ```

### Using Docker Compose

For easier setup, use Docker Compose:

```bash
docker-compose up -d
```

## API Documentation

Once running, access the API documentation at:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## API Endpoints

### Face Swap (Image)

```http
POST /api/v1/swap/face
```

Parameters:
- `source_img`: Image with face to use
- `target_img`: Image to place face onto
- `enhance_result`: (optional) Apply enhancements (default: true)
- `add_watermark`: (optional) Add watermark (default: true)

### Video Deepfake

```http
POST /api/v1/swap/video
```

Parameters:
- `source_img`: Image with face to use
- `target_video`: Video to process

Returns a task ID for monitoring progress.

### Check Task Status

```http
GET /api/v1/status/{task_id}
```

Returns the status and progress of a video processing task.

### Live Face Swap (WebSocket)

```
WebSocket: /api/v1/process/live
```

Protocol:
1. Connect to WebSocket
2. Send source image as base64 with type "source_image"
3. Send video frames with type "video_frame"
4. Receive processed frames with type "processed_frame"

## Performance Considerations

- GPU acceleration is enabled by default if available
- Video processing is batched for efficiency
- Consider reducing resolution for real-time applications

## Ethical Usage

This technology is provided for educational and creative purposes only. Please use responsibly and respect privacy.
