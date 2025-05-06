import cv2
import numpy as np
import os
import uuid
import base64
from datetime import datetime
import insightface
from insightface.app import FaceAnalysis
import threading
import logging
import time
from concurrent.futures import ThreadPoolExecutor
import os.path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize face analyzer
try:
    app = FaceAnalysis(name='buffalo_l')
    app.prepare(ctx_id=0, det_size=(640, 640))

    # Use a specific path to the model in your project directory
    model_path = os.path.join(os.path.dirname(__file__), 'models/inswapper_128.onnx')
    if not os.path.exists(model_path) or os.path.getsize(model_path) < 1000000:  # Check if file is too small
        # Try alternative locations
        alt_paths = [
            os.path.expanduser('~/.insightface/models/inswapper_128.onnx'),
            os.path.join(os.path.dirname(__file__), '../models/inswapper_128.onnx')
        ]

        for path in alt_paths:
            if os.path.exists(path) and os.path.getsize(path) > 1000000:
                model_path = path
                break

    try:
        swapper = insightface.model_zoo.get_model(model_path)
        logger.info(f"Successfully loaded model from {model_path}")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise

    logger.info("Face analysis models loaded successfully")
except Exception as e:
    logger.error(f"Error loading face analysis models: {str(e)}")
    raise

# Store active sessions
active_sessions = {}

def process_video(source_path, target_path, results_folder):
    """Process a video file with face swapping"""
    logger.info(f"Processing video: {target_path} with source: {source_path}")

    # Generate output filename
    output_filename = f"result_{uuid.uuid4()}.mp4"
    output_path = os.path.join(results_folder, output_filename)

    try:
        # Load source image
        source_img = cv2.imread(source_path)
        source_faces = app.get(source_img)
        if len(source_faces) == 0:
            raise ValueError("No face detected in the source image")
        source_face = source_faces[0]

        # Open target video
        video = cv2.VideoCapture(target_path)
        width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = video.get(cv2.CAP_PROP_FPS)
        total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))

        # Prepare output video
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        # Process each frame
        frame_count = 0

        def process_batch(frames_batch, indices):
            results = []
            for i, frame in zip(indices, frames_batch):
                # Detect faces in the frame
                target_faces = app.get(frame)
                result_frame = frame.copy()

                # Swap each detected face
                for target_face in target_faces:
                    result_frame = swapper.get(result_frame, target_face, source_face, paste_back=True)

                results.append((i, result_frame))
            return results

        batch_size = 5
        frames_batch = []
        indices_batch = []

        with ThreadPoolExecutor(max_workers=4) as executor:
            while video.isOpened():
                ret, frame = video.read()
                if not ret:
                    break

                frames_batch.append(frame)
                indices_batch.append(frame_count)
                frame_count += 1

                # Process in batches
                if len(frames_batch) >= batch_size or frame_count >= total_frames:
                    batch_results = executor.submit(process_batch, frames_batch, indices_batch).result()

                    # Write frames in order
                    for _, result_frame in sorted(batch_results, key=lambda x: x[0]):
                        out.write(result_frame)

                    # Clear batch
                    frames_batch = []
                    indices_batch = []

                # Log progress
                if frame_count % 30 == 0:
                    logger.info(f"Processed {frame_count}/{total_frames} frames")

        video.release()
        out.release()
        logger.info(f"Video processing complete: {output_path}")
        return output_path

    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        raise

def decode_image(image_data):
    """Decode base64 image data to OpenCV format"""
    if isinstance(image_data, str) and image_data.startswith('data:image'):
        # Extract base64 data from data URI
        image_data = image_data.split(',')[1]

    image_bytes = base64.b64decode(image_data)
    np_array = np.frombuffer(image_bytes, dtype=np.uint8)
    return cv2.imdecode(np_array, cv2.IMREAD_COLOR)

def encode_image(image):
    """Encode OpenCV image to base64"""
    _, buffer = cv2.imencode('.jpg', image)
    return base64.b64encode(buffer).decode('utf-8')

def setup_real_time_session(session_id, source_image_data):
    """Set up a new real-time face swap session"""
    try:
        source_img = decode_image(source_image_data)
        source_faces = app.get(source_img)

        if len(source_faces) == 0:
            raise ValueError("No face detected in the source image")

        active_sessions[session_id] = {
            'source_face': source_faces[0],
            'source_img': source_img,
            'last_activity': datetime.now(),
            'frames_processed': 0
        }

        logger.info(f"Real-time session {session_id} created")

        # Start cleanup thread if not already running
        if not hasattr(setup_real_time_session, "cleanup_running"):
            setup_real_time_session.cleanup_running = True
            threading.Thread(target=cleanup_inactive_sessions, daemon=True).start()

        return True
    except Exception as e:
        logger.error(f"Error setting up real-time session: {str(e)}")
        return False

def process_real_time_frame(session_id, frame_data):
    """Process a single frame for real-time face swapping"""
    try:
        if session_id not in active_sessions:
            logger.warning(f"Session {session_id} not found")
            return None

        # Update session activity
        session = active_sessions[session_id]
        session['last_activity'] = datetime.now()
        session['frames_processed'] += 1

        # Decode frame
        frame = decode_image(frame_data)

        # Detect faces in the frame
        target_faces = app.get(frame)
        result_frame = frame.copy()

        # Swap each detected face
        for target_face in target_faces:
            result_frame = swapper.get(result_frame, target_face, session['source_face'], paste_back=True)

        # Encode the result frame
        encoded_result = encode_image(result_frame)

        # Log activity periodically
        if session['frames_processed'] % 50 == 0:
            logger.info(f"Session {session_id} has processed {session['frames_processed']} frames")

        return encoded_result

    except Exception as e:
        logger.error(f"Error processing real-time frame: {str(e)}")
        return None

def cleanup_inactive_sessions():
    """Clean up inactive sessions periodically"""
    while True:
        try:
            current_time = datetime.now()
            inactive_sessions = []

            for session_id, session in active_sessions.items():
                # If session is inactive for more than 5 minutes
                if (current_time - session['last_activity']).seconds > 300:
                    inactive_sessions.append(session_id)

            # Remove inactive sessions
            for session_id in inactive_sessions:
                del active_sessions[session_id]
                logger.info(f"Removed inactive session: {session_id}")

            # Log active sessions count
            if active_sessions:
                logger.info(f"Active sessions: {len(active_sessions)}")

        except Exception as e:
            logger.error(f"Error in cleanup thread: {str(e)}")

        # Sleep for 1 minute
        time.sleep(60)
