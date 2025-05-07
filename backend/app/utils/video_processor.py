import os
import cv2
import numpy as np
import ffmpeg
import uuid
import tempfile
from ..config import settings
from ..models.face_swap import face_swap_engine

class VideoProcessor:
    """Utility class for video processing operations"""

    @staticmethod
    def extract_frames(video_path, max_frames=None):
        """Extract frames from a video file

        Args:
            video_path: Path to the input video file
            max_frames: Maximum number of frames to extract (None for all)

        Returns:
            List of frames as numpy arrays
        """
        frames = []

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Limit frames if specified
        if max_frames and frame_count > max_frames:
            # Extract frames at regular intervals
            step = frame_count // max_frames
            frame_indices = [i * step for i in range(max_frames)]
        else:
            # Extract all frames
            frame_indices = range(frame_count)

        for i in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, i)
            ret, frame = cap.read()
            if ret:
                frames.append(frame)
            else:
                break

        cap.release()
        return frames, fps

    @staticmethod
    def reconstruct_video(frames, output_path=None, fps=30, add_watermark=True):
        """Reconstruct a video from frames

        Args:
            frames: List of frames as numpy arrays
            output_path: Path for the output video file (optional)
            fps: Frames per second for the output video
            add_watermark: Whether to add a watermark to the output video

        Returns:
            Path to the output video file
        """
        if not frames:
            raise ValueError("No frames provided for video reconstruction")

        # Generate output path if not specified
        if not output_path:
            output_filename = f"deepfake_{uuid.uuid4()}.mp4"
            output_path = os.path.join(settings.RESULTS_DIR, output_filename)

        # Get frame dimensions from the first frame
        height, width = frames[0].shape[:2]

        # Create a VideoWriter object
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        # Add watermark to each frame and write to output video
        for frame in frames:
            if add_watermark:
                frame = face_swap_engine.add_watermark(frame, "DeepFaceSwap AI")
            out.write(frame)

        out.release()

        # Convert to H.264 codec for better compatibility
        try:
            temp_output = output_path + ".temp.mp4"

            # Use FFmpeg for conversion
            (
                ffmpeg
                .input(output_path)
                .output(temp_output, vcodec='libx264', crf=23, preset='medium')
                .run(quiet=True, overwrite_output=True)
            )

            # Replace original file with converted file
            os.replace(temp_output, output_path)
        except Exception as e:
            print(f"Error converting video format: {str(e)}")

        return output_path

    @staticmethod
    def process_video(source_img_path, target_video_path, progress_callback=None):
        """Process a video by swapping faces in all frames

        Args:
            source_img_path: Path to the source image (face to use)
            target_video_path: Path to the target video
            progress_callback: Function to report progress (0-100%)

        Returns:
            Path to the processed video
        """
        # Extract frames from the target video
        frames, fps = VideoProcessor.extract_frames(target_video_path)
        total_frames = len(frames)

        # Process the frames in batches for better memory management
        batch_size = settings.BATCH_SIZE
        processed_frames = []

        # Process each batch
        for i in range(0, total_frames, batch_size):
            batch = frames[i:i + batch_size]

            # Process batch
            processed_batch = face_swap_engine.batch_process_video(source_img_path, batch)
            processed_frames.extend(processed_batch)

            # Report progress
            if progress_callback:
                progress = min(100, (i + len(batch)) / total_frames * 100)
                progress_callback(progress)

        # Reconstruct video from processed frames
        output_path = VideoProcessor.reconstruct_video(processed_frames, fps=fps)

        return output_path

    @staticmethod
    def compress_for_streaming(video_path):
        """Compress a video for streaming

        Args:
            video_path: Path to the input video file

        Returns:
            Path to the compressed video
        """
        output_path = video_path.replace('.mp4', '_stream.mp4')

        try:
            # Use FFmpeg for conversion to a streaming-friendly format
            (
                ffmpeg
                .input(video_path)
                .output(
                    output_path,
                    vcodec='libx264',
                    preset='faster',
                    crf=28,
                    maxrate='2M',
                    bufsize='4M',
                    format='mp4'
                )
                .run(quiet=True, overwrite_output=True)
            )
        except Exception as e:
            print(f"Error compressing video for streaming: {str(e)}")
            return video_path

        return output_path

    @staticmethod
    def extract_frame_data(frame):
        """Convert frame to base64 string

        Args:
            frame: CV2 image

        Returns:
            Base64 string representation of the image
        """
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        return buffer.tobytes().hex()

    @staticmethod
    def decode_frame_data(frame_data):
        """Decode base64 frame data

        Args:
            frame_data: Base64 encoded frame data

        Returns:
            CV2 image
        """
        try:
            # Convert hex string to bytes
            binary_data = bytes.fromhex(frame_data)

            # Decode image from binary data
            frame = cv2.imdecode(np.frombuffer(binary_data, np.uint8), cv2.IMREAD_COLOR)
            return frame
        except Exception as e:
            print(f"Error decoding frame data: {str(e)}")
            return None

# Singleton instance
video_processor = VideoProcessor()
