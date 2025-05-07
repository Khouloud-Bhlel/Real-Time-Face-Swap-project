from celery import Celery
import os
from app.config import settings

celery_app = Celery(
    "tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

# Import tasks from app
celery_app.autodiscover_tasks(["app.utils.celery_tasks"])

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    enable_utc=True,
    task_track_started=True,
)

# Schedule periodic tasks
celery_app.conf.beat_schedule = {
    "cleanup-old-files": {
        "task": "app.utils.celery_tasks.cleanup_old_files",
        "schedule": 3600.0 * 12,  # Run twice daily
        "args": (24,)  # Keep files for 24 hours
    }
}

if __name__ == "__main__":
    celery_app.start()
