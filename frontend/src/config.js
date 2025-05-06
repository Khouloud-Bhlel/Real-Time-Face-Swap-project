// Backend server URL
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// API endpoints
export const API_ENDPOINTS = {
  FACE_SWAP: '/api/face-swap',
  RESULTS: '/api/results'
};

// WebSocket options
export const SOCKET_OPTIONS = {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: true
};

// Upload constraints
export const UPLOAD_CONSTRAINTS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime']
};
