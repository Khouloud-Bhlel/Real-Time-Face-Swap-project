import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
from insightface.data import get_image as ins_get_image
from ..config import settings

class FaceDetector:
    """Face detection and alignment using InsightFace models"""

    def __init__(self):
        self.app = None
        self.initialize()

    def initialize(self):
        """Initialize face detection model"""
        try:
            # Configure model with appropriate settings for face detection
            self.app = FaceAnalysis(
                name=settings.FACE_DETECTOR,
                allowed_modules=['detection', 'landmark_2d_106'],
                providers=['CUDAExecutionProvider', 'CPUExecutionProvider'] if settings.USE_GPU else ['CPUExecutionProvider']
            )
            self.app.prepare(ctx_id=0, det_size=(640, 640))
            print("✓ Face detection model loaded successfully")
        except Exception as e:
            print(f"Error initializing face detection model: {str(e)}")
            # Fall back to CPU if GPU fails
            try:
                self.app = FaceAnalysis(name=settings.FACE_DETECTOR)
                self.app.prepare(ctx_id=-1, det_size=(640, 640))
                print("✓ Face detection model loaded on CPU as fallback")
            except Exception as e2:
                print(f"Critical error initializing face detection: {str(e2)}")
                raise

    def get_faces(self, img):
        """Detect faces in an image

        Args:
            img: CV2 image in BGR format

        Returns:
            List of face objects with landmarks
        """
        if self.app is None:
            self.initialize()

        faces = self.app.get(img)
        return faces

    def get_largest_face(self, img):
        """Get the largest face in an image

        Args:
            img: CV2 image in BGR format

        Returns:
            Largest face object or None if no face detected
        """
        faces = self.get_faces(img)
        if not faces:
            return None

        # Find face with largest bounding box area
        largest_face = max(faces, key=lambda face: (face.bbox[2] - face.bbox[0]) * (face.bbox[3] - face.bbox[1]))
        return largest_face

    def get_face_embedding(self, face):
        """Get face embedding for identification/comparison

        Args:
            face: Face object from get_faces

        Returns:
            Embedding vector (numpy array)
        """
        return face.embedding if hasattr(face, 'embedding') else None

    def align_face(self, img, face, output_size=(512, 512)):
        """Align face based on landmarks

        Args:
            img: CV2 image
            face: Face object with landmarks
            output_size: Desired output size (width, height)

        Returns:
            Aligned face image
        """
        # Extract 5-point landmarks (eyes, nose, mouth corners)
        landmarks = face.landmark_2d_106
        if landmarks is None and hasattr(face, 'kps'):
            landmarks = face.kps

        if landmarks is None:
            # If no landmarks, just crop based on bounding box
            x1, y1, x2, y2 = map(int, face.bbox)
            cropped = img[y1:y2, x1:x2]
            return cv2.resize(cropped, output_size)

        # Use 5 points for alignment (eyes, nose, mouth corners)
        src = np.array([
            landmarks[38],  # Left eye
            landmarks[88],  # Right eye
            landmarks[51],  # Nose tip
            landmarks[33],  # Left mouth corner
            landmarks[93]   # Right mouth corner
        ], dtype=np.float32)

        # Define reference points for aligned face
        dst = np.array([
            [output_size[0]*0.35, output_size[1]*0.35],
            [output_size[0]*0.65, output_size[1]*0.35],
            [output_size[0]*0.5, output_size[1]*0.5],
            [output_size[0]*0.35, output_size[1]*0.75],
            [output_size[0]*0.65, output_size[1]*0.75]
        ], dtype=np.float32)

        # Calculate transformation matrix
        M = cv2.estimateAffinePartial2D(src, dst)[0]

        # Apply transformation
        aligned_face = cv2.warpAffine(img, M, output_size)
        return aligned_face

# Singleton instance for reuse
face_detector = FaceDetector()
