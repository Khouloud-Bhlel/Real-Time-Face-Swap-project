import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AnimatePresence } from 'framer-motion';
import theme from './theme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RealTimePage from './pages/RealTimePage';
import FaceSwapPage from './pages/FaceSwapPage';
import AboutPage from './pages/AboutPage';
import HistoryPage from './pages/HistoryPage';
import LoadingOverlay from './components/LoadingOverlay';
import './App.css';

function App() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading resources
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingOverlay key="loading" />
          ) : (
            <>
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/real-time" element={<RealTimePage />} />
                  <Route path="/face-swap" element={<FaceSwapPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                </Routes>
              </main>
              <Footer />
            </>
          )}
        </AnimatePresence>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
