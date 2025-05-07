import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

// Define API URLs - adjust to match our backend
const WEBSOCKET_URL = 'ws://localhost:8000/api/v1/process/live';

interface WebcamPreviewProps {
  referenceImage?: string | null;
  isProcessing?: boolean;
  onImageCaptured?: (imageUrl: string) => void;
}

const WebcamPreview: React.FC<WebcamPreviewProps> = ({
  referenceImage = null,
  isProcessing = false,
  onImageCaptured
}) => {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [streamActive, setStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [swapEnabled, setSwapEnabled] = useState(false);

  // Define captureFrame as a useCallback to avoid unnecessary recreations
  const captureFrame = useCallback(() => {
    if (!canvasRef.current || !videoRef.current || !onImageCaptured) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;

    // Draw the current frame to the canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to data URL and pass to parent component
      const imageUrl = canvas.toDataURL('image/jpeg', 0.85);
      onImageCaptured(imageUrl);
    }
  }, [onImageCaptured]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
              setStreamActive(true);
              setError(null);

              // Capture initial frame for processing after a short delay
              if (onImageCaptured) {
                setTimeout(captureFrame, 1000);
              }
            }
          };
        }
      } catch (err) {
        setError('Camera access denied or not available');
        setStreamActive(false);
        console.error('Error accessing camera:', err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onImageCaptured, captureFrame]);

  useEffect(() => {
    if (!streamActive || !canvasRef.current || !videoRef.current) return;

    let animationFrame: number;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    // Wait for video dimensions to be available
    const checkVideoDimensions = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setCanvasReady(true);
        startDrawing();
      } else {
        setTimeout(checkVideoDimensions, 100);
      }
    };

    const startDrawing = () => {
      // Set canvas size to match video
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;

      // Initialize output canvas with same dimensions
      if (outputCanvasRef.current) {
        outputCanvasRef.current.width = canvas.width;
        outputCanvasRef.current.height = canvas.height;
      }

      const drawFaceTrackingEffect = () => {
        if (!ctx || !video) return;

        // Ensure canvas dimensions are set correctly
        if (canvas.width === 0) {
          canvas.width = video.clientWidth;
          canvas.height = video.clientHeight;
        }

        // Increase brightness for better visibility
        ctx.filter = theme === 'dark'
          ? 'brightness(1.3) contrast(1.1)'
          : 'brightness(1.1) contrast(1.05)';
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        if (isProcessing || referenceImage) {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const faceWidth = canvas.width * 0.25;
          const faceHeight = canvas.height * 0.35;

          // Animated face tracking effect
          const time = Date.now() * 0.001;
          const pulseSize = Math.sin(time * 2) * 5;

          const glowColor = theme === 'dark' ? '147, 51, 234' : '79, 70, 229';
          ctx.strokeStyle = isProcessing
            ? `rgba(${glowColor}, ${0.6 + Math.sin(time * 3) * 0.2})`
            : `rgba(${glowColor}, ${0.4 + Math.sin(time * 3) * 0.2})`;
          ctx.lineWidth = 2;
          ctx.setLineDash(isProcessing ? [5, 5] : []);

          // Face outline with pulse effect
          ctx.beginPath();
          ctx.ellipse(
            centerX,
            centerY,
            faceWidth / 2 + pulseSize,
            faceHeight / 2 + pulseSize,
            0, 0, 2 * Math.PI
          );
          ctx.stroke();

          if (isProcessing) {
            // Animated landmarks with glow effect
            const landmarks = [
              [centerX - faceWidth * 0.15, centerY - faceHeight * 0.1],
              [centerX + faceWidth * 0.15, centerY - faceHeight * 0.1],
              [centerX, centerY + faceHeight * 0.05],
              [centerX - faceWidth * 0.12, centerY + faceHeight * 0.2],
              [centerX + faceWidth * 0.12, centerY + faceHeight * 0.2],
            ];

            landmarks.forEach(([x, y], i) => {
              const offset = Math.sin(time * 4 + i) * 2;

              // Glow effect
              const gradient = ctx.createRadialGradient(
                x + offset, y + offset, 0,
                x + offset, y + offset, 6
              );
              gradient.addColorStop(0, `rgba(${glowColor}, 0.8)`);
              gradient.addColorStop(1, `rgba(${glowColor}, 0)`);

              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(x + offset, y + offset, 6, 0, 2 * Math.PI);
              ctx.fill();

              // Center point
              ctx.fillStyle = `rgba(${glowColor}, 0.9)`;
              ctx.beginPath();
              ctx.arc(x + offset, y + offset, 2, 0, 2 * Math.PI);
              ctx.fill();
            });
          }
        }

        animationFrame = requestAnimationFrame(drawFaceTrackingEffect);
      };

      animationFrame = requestAnimationFrame(drawFaceTrackingEffect);
    };

    checkVideoDimensions();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [streamActive, isProcessing, referenceImage, theme]);

  // Set up WebSocket connection for real-time face swapping
  useEffect(() => {
    // Don't connect if no reference image is selected
    if (!referenceImage || !streamActive || !canvasRef.current) return;

    // Close existing connection if it exists
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Initialize new connection
    try {
      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setApiConnected(true);

        // Send reference image to backend when connection opens
        if (referenceImage) {
          ws.send(JSON.stringify({
            type: 'source_image',
            data: referenceImage
          }));
        }

        // Start sending frames after connection is established
        setSwapEnabled(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'processed_frame') {
            // Convert base64 image to a displayable image
            const img = new Image();
            img.onload = () => {
              if (outputCanvasRef.current) {
                const outputCtx = outputCanvasRef.current.getContext('2d');
                if (outputCtx) {
                  outputCtx.clearRect(0, 0, outputCanvasRef.current.width, outputCanvasRef.current.height);
                  outputCtx.drawImage(img, 0, 0, outputCanvasRef.current.width, outputCanvasRef.current.height);
                }
              }
            };
            img.src = 'data:image/jpeg;base64,' + message.data;
          }
          else if (message.type === 'error') {
            console.error('Server error:', message.message);
            setError(`API Error: ${message.message}`);
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setApiConnected(false);
        setError('Failed to connect to face swap service');
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setApiConnected(false);
        setSwapEnabled(false);
      };

      return () => {
        console.log('Closing WebSocket connection');
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        setSwapEnabled(false);
        setApiConnected(false);
      };
    } catch (err) {
      console.error('Error setting up WebSocket:', err);
      setError('Failed to initialize face swap connection');
      return () => {};
    }
  }, [referenceImage, streamActive]);

  // Send frames to backend when enabled
  useEffect(() => {
    if (!swapEnabled || !wsRef.current || !canvasRef.current || !streamActive) return;

    let animationFrame: number;
    const canvas = canvasRef.current;
    const fps = 15; // Limit to 15 FPS to reduce network traffic
    let lastFrameTime = 0;

    const sendFrame = (time: number) => {
      // Throttle to specified FPS
      if (time - lastFrameTime > 1000 / fps) {
        lastFrameTime = time;

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          // Send smaller frames to reduce bandwidth
          const scaleFactor = 0.5; // 50% of original size
          const smallCanvas = document.createElement('canvas');
          smallCanvas.width = canvas.width * scaleFactor;
          smallCanvas.height = canvas.height * scaleFactor;
          const smallCtx = smallCanvas.getContext('2d');

          if (smallCtx) {
            smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);

            // Convert to JPEG and send over WebSocket
            const dataUrl = smallCanvas.toDataURL('image/jpeg', 0.7);
            wsRef.current.send(JSON.stringify({
              type: 'video_frame',
              data: dataUrl.split(',')[1] // Remove data URL prefix
            }));
          }
        }
      }

      animationFrame = requestAnimationFrame(sendFrame);
    };

    animationFrame = requestAnimationFrame(sendFrame);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [swapEnabled, streamActive]);

  return (
    <div className={`
      relative overflow-hidden rounded-xl border theme-transition
      ${theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
      } shadow-lg animate-scale-in
    `}>
      {/* Video element as fallback if canvas isn't working */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={canvasReady ? "hidden" : "w-full aspect-video object-cover"}
      />

      {/* Canvas for drawing original webcam */}
      <canvas
        ref={canvasRef}
        className={apiConnected ? "hidden" : "w-full aspect-video object-cover"}
      />

      {/* Canvas for showing face swap results */}
      <canvas
        ref={outputCanvasRef}
        className={apiConnected ? "w-full aspect-video object-cover" : "hidden"}
      />

      {!streamActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/60 text-white animate-fade-in">
          <CameraOff className="h-12 w-12 mb-3 text-red-400 animate-bounce" />
          <p className="text-lg font-medium animate-slide-up">
            {error || 'Camera not connected'}
          </p>
          <p className="text-sm text-gray-300 mt-2 max-w-md text-center animate-slide-up delay-100">
            Please grant camera permission to use the face swap feature
          </p>
        </div>
      )}

      {!apiConnected && referenceImage && streamActive && (
        <div className="absolute bottom-4 left-4 right-4 px-4 py-2 rounded-lg bg-yellow-500/80 text-white flex items-center gap-2 animate-slide-up">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            Connecting to face swap service...
          </p>
        </div>
      )}

      {/* Capture button - shown when not using real-time swap */}
      {streamActive && onImageCaptured && (
        <button
          onClick={captureFrame}
          className={`
            absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all
            ${theme === 'dark'
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
            }
          `}
          aria-label="Capture frame"
        >
          <Camera className="h-6 w-6" />
        </button>
      )}

      {isProcessing && streamActive && (
        <div className={`
          absolute bottom-0 left-0 right-0 p-4 animate-slide-up
          ${theme === 'dark' ? 'glass-dark' : 'glass-light'}
        `}>
          <div className="flex items-center space-x-2">
            <div className="animate-pulse h-3 w-3 rounded-full bg-purple-500"></div>
            <p className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
              Processing face swap...
            </p>
          </div>
        </div>
      )}

      {referenceImage && (
        <div className={`
          absolute top-3 left-3 px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg
          animate-fade-in animate-float
          ${theme === 'dark' ? 'glass-dark text-white' : 'glass-light text-gray-800'}
        `}>
          <Camera className="h-3 w-3" />
          <span>Reference image applied</span>
        </div>
      )}

      {apiConnected && (
        <div className={`
          absolute top-3 right-3 px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg
          animate-fade-in animate-float
          ${theme === 'dark' ? 'glass-dark text-white' : 'glass-light text-gray-800'}
        `}>
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs">Live</span>
        </div>
      )}
    </div>
  );
};

export default WebcamPreview;
