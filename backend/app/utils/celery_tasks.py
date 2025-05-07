import os
import uuid
import time
from celery import Celery
from ..config import settings
from ..models.face_swap import face_swap_engine
from ..utils.video_processor import video_processor

# Initialize Celery
celery_app = Celery('tasks', broker=settings.CELERY_BROKER_URL, backend=settings.CELERY_RESULT_BACKEND)

# Task status storage (in-memory for now, could be moved to Redis/DB)
task_status = {}

@celery_app.task(bind=True)
def process_video_deepfake(self, source_img_path, target_video_path):
    """Process a video deepfake as an asynchronous task

    Args:
        source_img_path: Path to the source image
        target_video_path: Path to the target video

    Returns:
        Dict with task status and result info
    """
    task_id = self.request.id

    # Update task status
    task_status[task_id] = {
        'status': 'processing',
        'progress': 0,
        'start_time': time.time()
    }

    try:
        def update_progress(progress):
            task_status[task_id]['progress'] = progress
            # Also update Celery's task state
            self.update_state(
                state='PROGRESS',
                meta={'progress': progress}
            )

        # Process the video
        output_path = video_processor.process_video(
            source_img_path,
            target_video_path,
            update_progress
        )

        # Create a streaming version
        streaming_path = video_processor.compress_for_streaming(output_path)

        # Update task status
        task_status[task_id] = {
            'status': 'completed',
            'progress': 100,
            'result': {
                'download_url': f"/api/v1/results/{os.path.basename(output_path)}",
                'streaming_url': f"/api/v1/results/stream/{os.path.basename(streaming_path)}",
            },
            'finish_time': time.time()
        }

        # Return result info
        return {
            'status': 'completed',
            'download_url': f"/api/v1/results/{os.path.basename(output_path)}",
            'streaming_url': f"/api/v1/results/stream/{os.path.basename(streaming_path)}"
        }

    except Exception as e:
        # Update task status on error
        task_status[task_id] = {
            'status': 'failed',
            'error': str(e),
            'finish_time': time.time()
        }

        # Re-raise the exception
        raise

@celery_app.task
def cleanup_old_files(max_age_hours=24):
    """Clean up old files that are no longer needed

    Args:
        max_age_hours: Maximum age of files in hours
    """
    max_age_seconds = max_age_hours * 3600
    current_time = time.time()

    # Check uploads directory
    for filename in os.listdir(settings.UPLOAD_DIR):
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        if os.path.isfile(file_path):
            file_age = current_time - os.path.getmtime(file_path)
            if file_age > max_age_seconds:
                try:
                    os.remove(file_path)
                    print(f"Removed old upload: {file_path}")
                except Exception as e:
                    print(f"Error removing old upload {file_path}: {str(e)}")

    # Check results directory
    for filename in os.listdir(settings.RESULTS_DIR):
        file_path = os.path.join(settings.RESULTS_DIR, filename)
        if os.path.isfile(file_path):
            file_age = current_time - os.path.getmtime(file_path)
            if file_age > max_age_seconds:
                try:
                    os.remove(file_path)
                    print(f"Removed old result: {file_path}")
                except Exception as e:
                    print(f"Error removing old result {file_path}: {str(e)}")

def get_task_status(task_id):
    """Get the status of a task

    Args:
        task_id: The Celery task ID

    Returns:
        Dict with task status info
    """
    if task_id in task_status:
        return task_status[task_id]

    # Try to get task status from Celery
    task = process_video_deepfake.AsyncResult(task_id)

    if task.state == 'PENDING':
        return {
            'status': 'pending',
            'progress': 0
        }
    elif task.state == 'SUCCESS':
        return {
            'status': 'completed',
            'progress': 100,
            'result': task.result
        }
    elif task.state == 'FAILURE':
        return {
            'status': 'failed',
            'error': str(task.result)
        }
    elif task.state == 'PROGRESS':
        return {
            'status': 'processing',
            'progress': task.info.get('progress', 0)
        }

    return {
        'status': 'unknown'
    }
