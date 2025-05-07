import os
import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
# Using inswapper from model_zoo instead
from insightface.model_zoo import inswapper
import uuid
from ..config import settings
from .face_detection import face_detector

class FaceSwapEngine:
    """Engine for face swapping using InsightFace models"""

    def __init__(self):
        self.swapper = None
        self.model_initialized = False
        self.initialize()

        # Cache for source faces to avoid reprocessing
        self.face_cache = {}

    def initialize(self):
        """Initialize face swapping model"""
        model_path = os.path.join(settings.MODEL_DIR, 'inswapper_128.onnx')
        if not os.path.exists(model_path):
            print(f"Face swapping model not found at {model_path}")
            print("The API will still work, but face swapping features will be disabled")
            print("To enable face swapping, download inswapper_128.onnx and place it in the models directory")
            return

        try:
            # Initialize InsightFace swapper model
            self.swapper = inswapper.INSwapper(model_file=model_path)
            self.model_initialized = True
            print("✓ Face swapping model loaded successfully")
        except Exception as e:
            print(f"Error initializing face swapper model: {str(e)}")
            print("Face swapping features will be disabled")

    def get_source_face(self, source_img):
        """Get source face for swapping

        Args:
            source_img: CV2 image containing source face

        Returns:
            Source face object for swapping
        """
        # Check if image is a string/path and load if needed
        if isinstance(source_img, str):
            if source_img in self.face_cache:
                return self.face_cache[source_img]
            source_img = cv2.imread(source_img)

        # Get the largest face from the image
        source_face = face_detector.get_largest_face(source_img)

        if source_face is None:
            raise ValueError("No face detected in source image")

        # Cache using image path if provided
        if isinstance(source_img, str):
            self.face_cache[source_img] = source_face

        return source_face

    def swap_face(self, source_img, target_img, enhance_result=True):
        """Swap face from source image to target image

        Args:
            source_img: Source image (with face to use)
            target_img: Target image (to place face onto)
            enhance_result: Apply enhancements to result

        Returns:
            Image with swapped face
        """
        # Check if swapping is available
        if not self.model_initialized:
            print("Face swapping model not initialized - returning original image")
            return target_img

        # Ensure the swapper is initialized
        if self.swapper is None:
            self.initialize()

        # Get source face
        source_face = self.get_source_face(source_img)

        # Detect target faces
        target_faces = face_detector.get_faces(target_img)

        if not target_faces:
            print("No faces detected in target image")
            return target_img

        # Create a copy of the target image for modification
        result_img = target_img.copy()

        # Apply face swap to all detected faces
        for target_face in target_faces:
            try:
                # Perform the face swap
                result_img = self.swapper.swap_face(result_img, source_face, target_face)
            except Exception as e:
                print(f"Error swapping face: {str(e)}")
                continue

        # Apply enhancements if needed
        if enhance_result:
            result_img = self.enhance_image(result_img)

        return result_img

    def swap_face_video_frame(self, source_face, frame):
        """Swap face in a video frame

        Args:
            source_face: Preprocessed source face
            frame: Video frame to process

        Returns:
            Processed frame with swapped face
        """
        # Check if swapping is available
        if not self.model_initialized:
            return frame

        # Ensure the swapper is initialized
        if self.swapper is None:
            self.initialize()

        # Detect target faces
        target_faces = face_detector.get_faces(frame)

        if not target_faces:
            return frame

        # Apply face swap
        result_frame = frame.copy()
        for target_face in target_faces:
            try:
                result_frame = self.swapper.swap_face(result_frame, source_face, target_face)
            except Exception as e:
                print(f"Error swapping face in video frame: {str(e)}")
                continue

        return result_frame

    def enhance_image(self, img):
        """Apply enhancements to improve the swapped face

        Args:
            img: Image with swapped face

        Returns:
            Enhanced image
        """
        # Basic color correction
        img_lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(img_lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        img_lab = cv2.merge((cl, a, b))
        img_enhanced = cv2.cvtColor(img_lab, cv2.COLOR_LAB2BGR)

        # Apply a slight sharpening
        kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]]) / 5
        img_enhanced = cv2.filter2D(img_enhanced, -1, kernel)

        return img_enhanced

    def batch_process_video(self, source_img, frames, progress_callback=None):
        """Process multiple video frames with the same source face

        Args:
            source_img: Source image or path
            frames: List of video frames
            progress_callback: Function to call with progress updates

        Returns:
            List of processed frames
        """
        # Get source face once for all frames
        source_face = self.get_source_face(source_img)

        result_frames = []
        total_frames = len(frames)

        for i, frame in enumerate(frames):
            # Process frame
            result_frame = self.swap_face_video_frame(source_face, frame)
            result_frames.append(result_frame)

            # Report progress
            if progress_callback and i % 5 == 0:
                progress_callback(i / total_frames * 100)

        return result_frames

    def add_watermark(self, img, text="AI-Generated"):
        """Add a watermark to the image

        Args:
            img: Image to watermark
            text: Watermark text

        Returns:
            Watermarked image
        """
        h, w = img.shape[:2]
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = w / 1000
        thickness = max(1, int(w / 500))

        # Add semi-transparent overlay in corner
        overlay = img.copy()
        cv2.rectangle(overlay, (0, h-30), (w//4, h), (0, 0, 0), -1)
        cv2.putText(overlay, text, (10, h-10), font, font_scale, (255, 255, 255), thickness)

        # Apply the overlay with transparency
        alpha = 0.7
        result_img = cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0)

        return result_img

# Singleton instance for reuse
face_swap_engine = FaceSwapEngine()
