import React, { useState, useEffect } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Moon, Sun, Zap, Camera, Video, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPage: 'landing' | 'faceswap' | 'deepfake';
  setCurrentPage: (page: 'landing' | 'faceswap' | 'deepfake') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Real-Time Face Swap', icon: Camera, page: 'faceswap' as const },
    { name: 'Video Deepfake', icon: Video, page: 'deepfake' as const },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? theme === 'dark' 
          ? 'bg-gray-900/90 backdrop-blur-md border-b border-gray-800' 
          : 'bg-white/90 backdrop-blur-md shadow-sm'
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2" onClick={() => setCurrentPage('landing')} role="button">
            <Zap className={`h-6 w-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className={`font-bold text-xl ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              DeepFaceSwap<span className="text-purple-500">AI</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => setCurrentPage(link.page)}
                className={`flex items-center gap-2 py-2 transition-colors text-sm font-medium ${
                  currentPage === link.page
                    ? theme === 'dark'
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-purple-600 border-b-2 border-purple-600'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </button>
            ))}
            
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen 
              ? <X className={theme === 'dark' ? 'text-white' : 'text-gray-900'} /> 
              : <Menu className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden px-4 py-2 pb-4 ${
          theme === 'dark' ? 'bg-gray-900/95 border-b border-gray-800' : 'bg-white/95 shadow-md'
        }`}>
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                setCurrentPage(link.page);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 w-full py-3 px-2 transition-colors ${
                currentPage === link.page
                  ? theme === 'dark'
                    ? 'text-purple-400'
                    : 'text-purple-600'
                  : theme === 'dark'
                    ? 'text-gray-300'
                    : 'text-gray-700'
              }`}
            >
              <link.icon className="h-5 w-5" />
              {link.name}
            </button>
          ))}

          {/* Theme toggle in mobile menu */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 w-full py-3 px-2 ${
              theme === 'dark' ? 'text-yellow-300' : 'text-blue-600'
            }`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-5 w-5" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;