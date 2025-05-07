import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def mock_face_detector(monkeypatch):
    """Mock the face detector to avoid actual ML model loading."""
    class MockFaceDetector:
        def __init__(self):
            self.initialized = False
        
        def initialize(self):
            self.initialized = True
            return True
        
        def get_largest_face(self, image):
            # Return a mock face embedding
            import numpy as np
            return np.zeros((512,), dtype=np.float32)
    
    mock_detector = MockFaceDetector()
    from app.models import face_detection
    monkeypatch.setattr(face_detection, "face_detector", mock_detector)
    return mock_detector

@pytest.fixture
def mock_face_swap(monkeypatch):
    """Mock the face swap engine to avoid actual ML model loading."""
    class MockFaceSwap:
        def __init__(self):
            self.initialized = False
        
        def initialize(self):
            self.initialized = True
            return True
        
        def swap_face(self, source_face, target_image):
            # Return the target image as is (mock swap)
            return target_image
        
        def swap_face_video_frame(self, source_face, frame):
            # Return the frame as is (mock swap)
            return frame
    
    mock_swap = MockFaceSwap()
    from app.models import face_swap
    monkeypatch.setattr(face_swap, "face_swap_engine", mock_swap)
    return mock_swap