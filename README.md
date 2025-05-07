# DeepFaceSwap AI

<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-green.svg" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/Python-3.9+-orange.svg" alt="Python Version" />
  <img src="https://img.shields.io/badge/React-18.3+-61DAFB.svg" alt="React Version" />
</div>

## 🚀 Overview

DeepFaceSwap AI is a cutting-edge application that enables real-time face swapping in images and videos. Built with a modern stack including FastAPI, React, and AI-powered face detection and swapping technologies, it provides a seamless, user-friendly interface for creating high-quality deepfakes instantly.

![DeepFaceSwap Preview](frontend/public/preview.png)

## ✨ Features

- **Image Face Swap**: Instantly swap faces between two static images with accurate results
- **Real-time Video Deepfake**: Process videos with face swapping applied to every frame
- **Live Webcam Mode**: Apply face swaps in real-time using your webcam
- **Intuitive UI**: Modern, responsive interface with dark/light mode support
- **High-Quality Results**: Advanced AI models ensure realistic and seamless face swaps
- **Local Processing**: Privacy-focused approach with local processing options

## 🛠️ Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **Celery**: Distributed task queue for handling intensive processing
- **Redis**: Message broker for Celery
- **ONNX Runtime**: Optimized neural network inference
- **InsightFace**: Advanced face detection and recognition

### Frontend
- **React 18+**: Modern UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Next-generation frontend build tool

## 📋 Prerequisites

- Python 3.9+
- Node.js 18+
- Redis Server (for Celery task queue)
- FFmpeg (for video processing)
- GPU with CUDA support (recommended but optional)

## 🔧 Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend services:
   ```bash
   ./start_services.sh
   ```

   Or use Docker Compose:
   ```bash
   docker-compose up -d
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🖥️ Usage

1. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)
2. Choose between image swap mode or video deepfake
3. Upload or select a source face image
4. Upload a target image/video or use your webcam
5. Click "Swap Face" to generate the result

## 🚀 API Documentation

When the backend is running, access the API documentation at:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## 🧪 Key API Endpoints

### Face Swap (Image)
```http
POST /api/v1/swap/face
```

### Video Deepfake
```http
POST /api/v1/swap/video
```

### Live Face Swap (WebSocket)
```
WebSocket: /api/v1/process/live
```

## ⚡ Performance Tips

- Enable GPU acceleration for significantly faster processing
- Video processing is resource-intensive; consider reducing resolution for smoother results
- For real-time applications, use lower-resolution inputs for better performance

## 📚 Project Structure

```
real-time-face-swap/
├── backend/               # FastAPI backend service
│   ├── app/               # Main application code
│   │   ├── models/        # Data models
│   │   ├── routes/        # API endpoints
│   │   └── utils/         # Utility functions
│   ├── models/            # AI model files
│   └── requirements.txt   # Python dependencies
└── frontend/              # React frontend application
    ├── public/            # Static assets
    └── src/               # React source code
        ├── components/    # UI components
        └── main.tsx       # App entry point
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Ethical Usage Notice

This technology is provided for educational and creative purposes only. Please use responsibly and respect privacy and consent. Do not use this technology to create content that:

- Misrepresents individuals
- Creates harmful or misleading content
- Violates privacy or intellectual property rights

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

Project Link: https://github.com/yourusername/real-time-face-swap
