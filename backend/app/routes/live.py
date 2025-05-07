import os
import base64
import cv2
import numpy as np
import uuid
import json
import time
from typing import Dict, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse
from ..config import settings
from ..models.face_swap import face_swap_engine
from ..models.face_detection import face_detector
from ..utils.video_processor import video_processor

router = APIRouter()

# Store active WebSocket connections
active_connections: Dict[str, Dict] = {}

class ConnectionManager:
    """Manager for WebSocket connections"""

    @staticmethod
    async def connect(websocket: WebSocket, session_id: str) -> None:
        """Accept a new WebSocket connection"""
        await websocket.accept()

        # Store connection info
        if session_id not in active_connections:
            active_connections[session_id] = {
                "websocket": websocket,
                "source_face": None,
                "connected_at": time.time()
            }
        else:
            # Update existing session
            active_connections[session_id]["websocket"] = websocket

    @staticmethod
    def disconnect(session_id: str) -> None:
        """Remove a WebSocket connection"""
        if session_id in active_connections:
            del active_connections[session_id]

    @staticmethod
    def get_connection(session_id: str) -> Optional[dict]:
        """Get connection info for a session"""
        return active_connections.get(session_id)

    @staticmethod
    def store_source_face(session_id: str, source_face: np.ndarray) -> None:
        """Store source face for a session"""
        if session_id in active_connections:
            active_connections[session_id]["source_face"] = source_face

    @staticmethod
    def get_active_sessions() -> int:
        """Get number of active sessions"""
        return len(active_connections)

# Initialize connection manager
connection_manager = ConnectionManager()

@router.websocket("/process/live")
async def live_face_swap(websocket: WebSocket):
    """WebSocket endpoint for real-time face swapping

    This endpoint manages a WebSocket connection for live face swapping
    with webcam stream. It processes frames in real-time and returns
    the processed frames with swapped faces.
    """
    # Generate a session ID if not provided
    session_id = str(uuid.uuid4())
    source_face = None

    try:
        # Accept the connection
        await connection_manager.connect(websocket, session_id)

        # Send initial session info
        await websocket.send_json({
            "type": "session_created",
            "session_id": session_id
        })

        # Process incoming messages
        while True:
            # Receive message from WebSocket
            data = await websocket.receive_text()
            message = json.loads(data)
            message_type = message.get("type")

            if message_type == "source_image":
                # Process source image for face detection
                try:
                    # Decode base64 image
                    encoded_data = message.get("data").split(",")[1]
                    img_bytes = base64.b64decode(encoded_data)
                    img_array = np.frombuffer(img_bytes, np.uint8)
                    source_img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

                    # Get source face
                    source_face = face_detector.get_largest_face(source_img)

                    if source_face is None:
                        await websocket.send_json({
                            "type": "error",
                            "message": "No face detected in source image"
                        })
                        continue

                    # Store source face in session
                    connection_manager.store_source_face(session_id, source_face)

                    # Send confirmation
                    await websocket.send_json({
                        "type": "source_image_processed",
                        "message": "Face detected and ready for swapping"
                    })
                except Exception as e:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Error processing source image: {str(e)}"
                    })

            elif message_type == "video_frame":
                # Process video frame for face swapping
                try:
                    # Get source face
                    conn_info = connection_manager.get_connection(session_id)
                    if not conn_info or conn_info.get("source_face") is None:
                        await websocket.send_json({
                            "type": "error",
                            "message": "Source face not set. Send source_image first."
                        })
                        continue

                    source_face = conn_info["source_face"]

                    # Decode video frame
                    encoded_data = message.get("data").split(",")[1]
                    img_bytes = base64.b64decode(encoded_data)
                    img_array = np.frombuffer(img_bytes, np.uint8)
                    frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

                    # Process the frame
                    result_frame = face_swap_engine.swap_face_video_frame(source_face, frame)

                    # Encode result frame to base64
                    _, buffer = cv2.imencode('.jpg', result_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                    encoded_result = base64.b64encode(buffer).decode('utf-8')

                    # Send processed frame
                    await websocket.send_json({
                        "type": "processed_frame",
                        "data": f"data:image/jpeg;base64,{encoded_result}"
                    })
                except Exception as e:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Error processing video frame: {str(e)}"
                    })

            elif message_type == "ping":
                # Respond to ping messages
                await websocket.send_json({
                    "type": "pong",
                    "timestamp": time.time()
                })

    except WebSocketDisconnect:
        # Handle disconnect
        connection_manager.disconnect(session_id)
    except Exception as e:
        # Handle other errors
        print(f"WebSocket error: {str(e)}")
        connection_manager.disconnect(session_id)

@router.get("/status/active-sessions")
async def get_active_sessions():
    """Get number of active WebSocket sessions"""
    return JSONResponse({
        "active_sessions": connection_manager.get_active_sessions()
    })
