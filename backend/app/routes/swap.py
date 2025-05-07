import os
import cv2
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from starlette.requests import Request
from starlette.responses import StreamingResponse
from ..config import settings
from ..models.face_swap import face_swap_engine
from ..utils.video_processor import video_processor
from ..utils.celery_tasks import process_video_deepfake, get_task_status
from slowapi.util import get_remote_address
from slowapi import Limiter, _rate_limit_exceeded_handler

# Setup rate limiting
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()

@router.post("/swap/face")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def face_swap(
    request: Request,
    source_img: UploadFile = File(...),
    target_img: UploadFile = File(...),
    enhance_result: bool = Form(True),
    add_watermark: bool = Form(True)
):
    """Swap faces between two images

    Args:
        source_img: Image containing face to use
        target_img: Image to place face onto
        enhance_result: Whether to enhance the result
        add_watermark: Whether to add watermark

    Returns:
        Processed image as binary data
    """
    try:
        # Save uploaded files
        source_filename = f"{uuid.uuid4()}_{source_img.filename}"
        target_filename = f"{uuid.uuid4()}_{target_img.filename}"

        source_path = os.path.join(settings.UPLOAD_DIR, source_filename)
        target_path = os.path.join(settings.UPLOAD_DIR, target_filename)

        # Save source image
        with open(source_path, "wb") as f:
            f.write(await source_img.read())

        # Save target image
        with open(target_path, "wb") as f:
            f.write(await target_img.read())

        # Process face swap
        source_img_data = cv2.imread(source_path)
        target_img_data = cv2.imread(target_path)

        result_img = face_swap_engine.swap_face(source_img_data, target_img_data, enhance_result)

        if add_watermark:
            result_img = face_swap_engine.add_watermark(result_img)

        # Save result
        result_filename = f"result_{uuid.uuid4()}.jpg"
        result_path = os.path.join(settings.RESULTS_DIR, result_filename)
        cv2.imwrite(result_path, result_img)

        # Return the processed image
        return FileResponse(
            result_path,
            media_type="image/jpeg",
            filename="face_swap_result.jpg"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/swap/video")
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def video_deepfake(
    request: Request,
    background_tasks: BackgroundTasks,
    source_img: UploadFile = File(...),
    target_video: UploadFile = File(...)
):
    """Process video deepfake

    Args:
        source_img: Image containing face to use
        target_video: Video to process

    Returns:
        Task ID for checking status
    """
    try:
        # Save uploaded files
        source_filename = f"{uuid.uuid4()}_{source_img.filename}"
        target_filename = f"{uuid.uuid4()}_{target_video.filename}"

        source_path = os.path.join(settings.UPLOAD_DIR, source_filename)
        target_path = os.path.join(settings.UPLOAD_DIR, target_filename)

        # Save source image
        with open(source_path, "wb") as f:
            f.write(await source_img.read())

        # Save target video
        with open(target_path, "wb") as f:
            f.write(await target_video.read())

        # Start asynchronous task
        task = process_video_deepfake.delay(source_path, target_path)

        return JSONResponse({
            "status": "processing",
            "task_id": task.id,
            "message": "Video processing started"
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{task_id}")
async def check_task_status(task_id: str):
    """Check status of video processing task

    Args:
        task_id: Task ID from video_deepfake endpoint

    Returns:
        Task status info
    """
    try:
        status_info = get_task_status(task_id)
        return JSONResponse(status_info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results/{result_id}")
async def get_result(result_id: str):
    """Get video processing result

    Args:
        result_id: Result ID (filename)

    Returns:
        Processed video file
    """
    try:
        result_path = os.path.join(settings.RESULTS_DIR, result_id)

        if not os.path.exists(result_path):
            raise HTTPException(status_code=404, detail="Result not found")

        return FileResponse(
            result_path,
            media_type="video/mp4",
            filename=f"deepfake_{result_id}"
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results/stream/{result_id}")
async def stream_result(result_id: str):
    """Stream video processing result

    Args:
        result_id: Result ID (filename)

    Returns:
        Streaming response for video
    """
    try:
        result_path = os.path.join(settings.RESULTS_DIR, result_id)

        if not os.path.exists(result_path):
            raise HTTPException(status_code=404, detail="Result not found")

        # Create streaming response
        def iterfile():
            with open(result_path, mode="rb") as file_like:
                yield from file_like

        return StreamingResponse(
            iterfile(),
            media_type="video/mp4"
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
