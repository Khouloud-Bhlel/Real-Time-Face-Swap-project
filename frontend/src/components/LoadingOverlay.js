import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import '../styles/LoadingOverlay.css';

const LoadingOverlay = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="loading-overlay"
    >
      <Box sx={{ textAlign: 'center' }}>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          <div className="face-icon"></div>
        </motion.div>

        <Typography
          variant="h4"
          sx={{ mt: 3, color: '#fff', fontWeight: 600 }}
        >
          FaceSwap AI
        </Typography>

        <Box sx={{ mt: 4 }}>
          <div className="loader">
            <div className="loader-bar"></div>
          </div>
        </Box>
      </Box>
    </motion.div>
  );
};

export default LoadingOverlay;
