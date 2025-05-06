import React, { useRef, useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import Webcam from 'react-webcam';
import ImageUploader from '../components/ImageUploader';
import { BACKEND_URL } from '../config';
import '../styles/RealTimePage.css';

const RealTimePage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [sourceImage, setSourceImage] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState('');
  const [fpsCount, setFpsCount] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const socketRef = useRef(null);
  const webcamRef = useRef(null);
  const outputCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastFrameTimeRef = useRef(Date.now());
  const frameCountRef = useRef(0);

  // Connect to WebSocket server
  useEffect(() => {
    socketRef.current = io(BACKEND_URL);

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setError('');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (err) => {
      setError(`Connection error: ${err.message}`);
    });

    socketRef.current.on('session_created', (data) => {
      setSessionId(data.session_id);
      setIsSwapping(true);
      startRealTimeSwap();
    });

    socketRef.current.on('processed_frame', (data) => {
      if (data.session_id === sessionId) {
        drawProcessedFrame(data.frame);
        frameCountRef.current += 1;
      }
    });

    // Calculate FPS
    const fpsInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastFrameTimeRef.current) / 1000;
      const currentFps = Math.round(frameCountRef.current / elapsed);
      setFpsCount(currentFps);

      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }, 1000);

    return () => {
      socketRef.current.disconnect();
      clearInterval(fpsInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleSourceImageUpload = (image) => {
    setSourceImage(image);
    setShowInstructions(false);
  };

  const startSession = () => {
    if (!sourceImage) {
      setError('Please upload a source face image first.');
      return;
    }

    setError('');
    socketRef.current.emit('start_real_time_swap', {
      source_image: sourceImage
    });
  };

  const stopSession = () => {
    setIsSwapping(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const startRealTimeSwap = () => {
    if (!webcamRef.current || !outputCanvasRef.current) return;

    const sendFrame = () => {
      if (!isSwapping || !webcamRef.current?.video?.readyState) {
        return;
      }

      const video = webcamRef.current.video;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // Send frame to server
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      socketRef.current.emit('video_frame', {
        frame: frameData,
        session_id: sessionId
      });

      animationFrameRef.current = requestAnimationFrame(sendFrame);
    };

    animationFrameRef.current = requestAnimationFrame(sendFrame);
  };

  const drawProcessedFrame = (frameData) => {
    if (!outputCanvasRef.current) return;

    const canvas = outputCanvasRef.current;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = `data:image/jpeg;base64,${frameData}`;
  };

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Real-Time Face Swap
        </Typography>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="body1" color="text.secondary" paragraph>
              Experience instant face swapping in real-time using your webcam.
              Upload a single source image, and see your face transformed live on camera!
            </Typography>
          </Paper>
        </motion.div>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box className="video-container">
              <Typography variant="h6" gutterBottom>Source Image</Typography>
              <Paper
                elevation={2}
                className="upload-container"
                sx={{
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {sourceImage ? (
                  <img
                    src={sourceImage}
                    alt="Source face"
                    style={{ maxHeight: '100%', maxWidth: '100%' }}
                  />
                ) : (
                  <ImageUploader onImageUploaded={handleSourceImageUpload} />
                )}
              </Paper>

              {sourceImage && (
                <Button
                  variant="outlined"
                  onClick={() => setSourceImage(null)}
                  sx={{ mb: 2 }}
                >
                  Change Image
                </Button>
              )}

              <Button
                variant="contained"
                color="primary"
                disabled={!sourceImage || isSwapping}
                onClick={startSession}
                fullWidth
              >
                Start Real-Time Face Swap
              </Button>

              {isSwapping && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={stopSession}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Stop
                </Button>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box className="video-container">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Live Result</Typography>
                {isSwapping && (
                  <Typography variant="body2" color="text.secondary">
                    FPS: {fpsCount}
                  </Typography>
                )}
              </Box>

              <Paper
                elevation={2}
                sx={{
                  position: 'relative',
                  height: 360,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    mirrored
                    style={{
                      display: showInstructions ? 'block' : 'none',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />

                  <canvas
                    ref={outputCanvasRef}
                    style={{
                      display: !showInstructions ? 'block' : 'none',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />

                  {showInstructions && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        padding: 3,
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        How it works:
                      </Typography>
                      <Typography variant="body2">
                        1. Upload a face image on the left
                      </Typography>
                      <Typography variant="body2">
                        2. Click "Start Real-Time Face Swap"
                      </Typography>
                      <Typography variant="body2">
                        3. See your face transformed instantly!
                      </Typography>
                    </Box>
                  )}

                  {isSwapping && !isConnected && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CircularProgress color="primary" />
                      <Typography variant="body1" color="white" sx={{ mt: 2 }}>
                        Connecting to server...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default RealTimePage;
