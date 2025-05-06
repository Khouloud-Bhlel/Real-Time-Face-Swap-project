# Real-Time Face Swap

<p align="center">
  <img src="https://img.shields.io/badge/AI-Face%20Swap-blue" alt="AI Face Swap">
  <img src="https://img.shields.io/badge/Python-3.12-green" alt="Python 3.12">
  <img src="https://img.shields.io/badge/React-18.2.0-blue" alt="React 18.2.0">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

<p align="center">
  <img src="frontend/public/demo.gif" alt="Demo" width="600">
</p>

A powerful web application that lets you swap faces in real-time using your webcam or process uploaded videos with a single source image. Built with React, Flask, and InsightFace's AI models.

## ✨ Features

- **Real-time face swapping** through webcam feed
- **Video processing** for pre-recorded content
- **Beautiful, animated UI** with interactive elements
- **History tracking** of previous face swaps
- **Responsive design** that works on various screen sizes

## 🔧 Technology Stack

### Frontend
- React 18
- Material UI
- Framer Motion for animations
- Socket.IO for real-time communication
- React Router for navigation

### Backend
- Flask web server
- Flask-SocketIO for WebSocket support
- InsightFace for AI face swapping
- OpenCV for image/video processing
- ONNX Runtime for model inference

## 📋 Prerequisites

- Python 3.8+ (tested with 3.12)
- Node.js 14+ and npm
- Git LFS (for downloading model files)
- Webcam (for real-time features)

## 🚀 Installation

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/real-time-face-swap.git
cd real-time-face-swap
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage
Run the application:
```bash
python face_swap.py
```
## 📁 Project Structure

The project is organized as follows:

```
real-time-face-swap/
├── backend/
│   ├── app.py                 # Flask server and API endpoints
│   ├── face_swap_utils.py     # Core face swapping logic
│   ├── requirements.txt       # Python dependencies
│   ├── models/                # AI model storage (e.g., ONNX models)
│   ├── uploads/               # Temporary storage for uploaded files
│   └── results/               # Storage for processed output files
├── frontend/
│   ├── public/                # Static assets (e.g., images, demo files)
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Application pages (e.g., Home, Real-Time Swap)
│   │   ├── styles/            # CSS and styling files
│   │   ├── App.js             # Main React application component
│   │   └── index.js           # Entry point for the React app
│   └── package.json           # Node.js dependencies and scripts
└── README.md                  # Documentation for the project
```

This structure separates the backend and frontend codebases, ensuring modularity and ease of development. Each folder has a specific purpose, making it easier to navigate and maintain the project.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments
- OpenCV for providing robust computer vision tools.
- Inspiration from various face-swapping projects.
