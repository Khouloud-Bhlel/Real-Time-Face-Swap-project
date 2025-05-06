from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
import uuid
from werkzeug.utils import secure_filename
import face_swap_utils
import logging

app = Flask(__name__)
app.config['SECRET_KEY'] = 'faceswap_secret!'
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['RESULTS_FOLDER'] = 'results/'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Create directories if they don't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['RESULTS_FOLDER'], exist_ok=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/api/face-swap', methods=['POST'])
def face_swap():
    try:
        if 'source_image' not in request.files or 'target_video' not in request.files:
            return jsonify({'status': 'error', 'message': 'Missing files'}), 400

        source_image = request.files['source_image']
        target_video = request.files['target_video']

        # Generate unique filenames
        source_filename = secure_filename(f"{uuid.uuid4()}_{source_image.filename}")
        target_filename = secure_filename(f"{uuid.uuid4()}_{target_video.filename}")

        # Save uploaded files
        source_path = os.path.join(app.config['UPLOAD_FOLDER'], source_filename)
        target_path = os.path.join(app.config['UPLOAD_FOLDER'], target_filename)
        source_image.save(source_path)
        target_video.save(target_path)

        # Process the face swap (non-realtime)
        result_path = face_swap_utils.process_video(source_path, target_path, app.config['RESULTS_FOLDER'])

        return jsonify({
            'status': 'success',
            'result_url': f"/api/results/{os.path.basename(result_path)}"
        })

    except Exception as e:
        logger.error(f"Error in face_swap: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/results/<filename>')
def get_result(filename):
    return send_file(os.path.join(app.config['RESULTS_FOLDER'], filename))

# WebSocket for real-time face swap
@socketio.on('connect')
def handle_connect():
    logger.info('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')

@socketio.on('start_real_time_swap')
def handle_real_time_swap(data):
    source_image_data = data.get('source_image')
    session_id = data.get('session_id', str(uuid.uuid4()))

    # Set up real-time face swap session
    face_swap_utils.setup_real_time_session(session_id, source_image_data)
    emit('session_created', {'session_id': session_id})

@socketio.on('video_frame')
def handle_video_frame(data):
    frame_data = data.get('frame')
    session_id = data.get('session_id')

    # Process the frame
    result_frame = face_swap_utils.process_real_time_frame(session_id, frame_data)

    # Return the processed frame
    emit('processed_frame', {'frame': result_frame, 'session_id': session_id})

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0')
