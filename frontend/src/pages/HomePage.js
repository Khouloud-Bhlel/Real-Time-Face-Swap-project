import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Grid, Box, Paper } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import HistoryIcon from '@mui/icons-material/History';
import { useInView } from 'react-intersection-observer';
import '../styles/HomePage.css';

// Particles background component
const ParticleBackground = () => {
  return <div className="particles-container"></div>;
};

const FeatureCard = ({ icon, title, description, delay }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { delay, duration: 0.7, type: 'spring', stiffness: 100 }
      });
    }
  }, [controls, inView, delay]);

  return (
    <Grid item xs={12} md={4}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
        whileHover={{ y: -10, transition: { duration: 0.3 } }}
      >
        <Paper
          elevation={6}
          className="feature-card"
          sx={{
            p: 4,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '5px',
              background: 'linear-gradient(90deg, #2196f3, #64b5f6)',
            }
          }}
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 60 }}
          >
            <Box
              className="icon-container"
              sx={{
                background: 'linear-gradient(135deg, #2196f3, #1565c0)',
                borderRadius: '50%',
                p: 2.5,
                mb: 3,
                color: 'white',
                boxShadow: '0 10px 20px rgba(33, 150, 243, 0.3)',
              }}
            >
              {icon}
            </Box>
          </motion.div>

          <Typography variant="h5" component="h3" gutterBottom fontWeight="600">
            {title}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {description}
          </Typography>
        </Paper>
      </motion.div>
    </Grid>
  );
};

const StepBox = ({ number, title, description }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        scale: 1,
        transition: { delay: number * 0.2, duration: 0.6 }
      });
    }
  }, [controls, inView, number]);

  return (
    <Grid item xs={12} md={4}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={controls}
      >
        <Box className="step-box" sx={{ textAlign: 'center' }}>
          <motion.div
            whileHover={{
              scale: 1.1,
              boxShadow: '0 15px 30px rgba(33, 150, 243, 0.4)',
              transition: { duration: 0.3 }
            }}
          >
            <Box className="step-number">
              {number}
            </Box>
          </motion.div>

          <Typography variant="h6" gutterBottom fontWeight="600" mt={2}>
            {title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </motion.div>
    </Grid>
  );
};

const HomePage = () => {
  return (
    <div className="home-page">
      <ParticleBackground />

      <Box className="hero-section">
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Typography
              variant="h1"
              component="h1"
              className="hero-title"
              sx={{ fontWeight: 800 }}
            >
              <motion.span
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="gradient-text"
              >
                Real-Time
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                Face Swap
              </motion.span>
            </Typography>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.7 }}
            >
              <Typography
                variant="h5"
                component="h2"
                className="hero-subtitle"
                color="text.secondary"
                sx={{ mb: 6, maxWidth: '800px', mx: 'auto', lineHeight: 1.6 }}
              >
                Transform any video or live webcam feed with a single image using our
                <span className="highlight"> advanced AI </span>
                face swapping technology
              </Typography>
            </motion.div>

            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.7 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(33, 150, 243, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    component={Link}
                    to="/real-time"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<VideoCameraFrontIcon />}
                    className="glow-button"
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontWeight: 600,
                      fontSize: '1.05rem'
                    }}
                  >
                    Try Real-Time Swap
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    component={Link}
                    to="/face-swap"
                    variant="outlined"
                    color="primary"
                    size="large"
                    startIcon={<AutoAwesomeIcon />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                      }
                    }}
                  >
                    One-Click Video Swap
                  </Button>
                </motion.div>
              </Box>
            </motion.div>

            <motion.div
              className="scroll-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
            >
              <Box sx={{ mt: 10, mb: -8 }}>
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                >
                  <Box className="mouse-scroll"></Box>
                </motion.div>
              </Box>
            </motion.div>
          </motion.div>
        </Container>
      </Box>

      <Box className="wave-divider">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#f5f5f5" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,101.3C384,107,480,149,576,149.3C672,149,768,107,864,96C960,85,1056,107,1152,133.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </Box>

      <Container sx={{ py: 10 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 2, fontWeight: 700 }}
            className="section-title"
          >
            Features
          </Typography>

          <Box sx={{ width: '80px', height: '4px', bgcolor: 'primary.main', mx: 'auto', mb: 6 }}></Box>
        </motion.div>

        <Grid container spacing={4}>
          <FeatureCard
            icon={<VideoCameraFrontIcon fontSize="large" />}
            title="Real-Time Face Swap"
            description="Experience instant face swapping through your webcam with minimal latency. Perfect for virtual meetings, streaming, or just having fun!"
            delay={0.3}
          />

          <FeatureCard
            icon={<AutoAwesomeIcon fontSize="large" />}
            title="One-Click Video Processing"
            description="Transform any video with a single source image. Upload your face image and target video, then let our AI do the magic."
            delay={0.5}
          />

          <FeatureCard
            icon={<HistoryIcon fontSize="large" />}
            title="Save & Share Results"
            description="Download your face-swapped videos and share them with friends. Access your history to revisit previous creations anytime."
            delay={0.7}
          />
        </Grid>
      </Container>

      <Box className="demo-section" sx={{ py: 10, backgroundColor: '#f5f5f5', position: 'relative' }}>
        <div className="shape-divider"></div>

        <Container>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h3"
              align="center"
              gutterBottom
              sx={{ fontWeight: 700 }}
              className="section-title"
            >
              How It Works
            </Typography>

            <Box sx={{ width: '60px', height: '3px', bgcolor: 'primary.main', mx: 'auto', mb: 6 }}></Box>

            <Box sx={{ maxWidth: '900px', mx: 'auto', mt: 8, position: 'relative' }}>
              <div className="process-line"></div>
              <Grid container spacing={5}>
                <StepBox
                  number={1}
                  title="Upload"
                  description="Provide a single source image containing a face"
                />

                <StepBox
                  number={2}
                  title="Process"
                  description="Our AI analyzes the face and applies it in real-time"
                />

                <StepBox
                  number={3}
                  title="Result"
                  description="Enjoy your transformed video or real-time webcam feed"
                />
              </Grid>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 10 }}>
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(255, 64, 129, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  component={Link}
                  to="/about"
                  variant="contained"
                  color="secondary"
                  size="large"
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                  className="pulse-button"
                >
                  Learn More About The Technology
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Container>

        <Box className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </Box>
      </Box>
    </div>
  );
};

export default HomePage;
