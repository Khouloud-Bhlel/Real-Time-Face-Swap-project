import React from 'react';
import Navbar from './Navbar';
import { useTheme } from '../theme/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'landing' | 'faceswap' | 'deepfake';
  setCurrentPage: (page: 'landing' | 'faceswap' | 'deepfake') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="container mx-auto px-4 pb-10">
        {children}
      </main>
      <footer className={`py-6 text-center text-sm ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        <p>© 2025 DeepFaceSwap AI • For Entertainment Purposes Only</p>
        <p className="mt-1 text-xs">Do not use to create misleading or harmful content</p>
      </footer>
    </div>
  );
};

export default Layout;