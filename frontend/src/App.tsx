import React, { useState } from 'react';
import { ThemeProvider } from './components/theme/ThemeContext';
import Layout from './components/layout/Layout';
import LandingPage from './components/pages/LandingPage';
import FaceSwapStudio from './components/pages/FaceSwapStudio';
import VideoDeepfake from './components/pages/VideoDeepfake';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'faceswap' | 'deepfake'>('landing');

  return (
    <ThemeProvider>
      <Layout setCurrentPage={setCurrentPage} currentPage={currentPage}>
        {currentPage === 'landing' && <LandingPage onGetStarted={() => setCurrentPage('faceswap')} />}
        {currentPage === 'faceswap' && <FaceSwapStudio onSwitchMode={() => setCurrentPage('deepfake')} />}
        {currentPage === 'deepfake' && <VideoDeepfake onSwitchMode={() => setCurrentPage('faceswap')} />}
      </Layout>
    </ThemeProvider>
  );
}

export default App;