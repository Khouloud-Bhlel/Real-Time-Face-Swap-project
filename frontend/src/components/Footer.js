import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import FaceIcon from '@mui/icons-material/Face';

const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: '#1a237e', color: 'white', py: 6, mt: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.8 }}>
                <FaceIcon sx={{ mr: 1, fontSize: 28 }} />
              </motion.div>
              <Typography variant="h6" fontWeight="700">
                FaceSwap AI
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.7, maxWidth: '300px' }}>
              Advanced face swapping technology powered by AI to transform videos and live webcam feeds.
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {['Home', 'Real-Time Swap', 'Video Swap', 'About', 'History'].map((item) => (
                <Box component="li" key={item} sx={{ mb: 1 }}>
                  <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                    <Link href="#" color="inherit" sx={{ opacity: 0.8, textDecoration: 'none', '&:hover': { opacity: 1 } }}>
                      {item}
                    </Link>
                  </motion.div>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
              support@faceswapai.com
            </Typography>
            <Box sx={{ mt: 3 }}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href="#"
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textDecoration: 'none'
                  }}
                >
                  Contact Us
                </Link>
              </motion.div>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} FaceSwap AI. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
