import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { X } from 'lucide-react';
import Login from './Login';
import Register from './Register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialView = 'login'
}) => {
  const { theme } = useTheme();
  const [view, setView] = useState<'login' | 'register'>(initialView);

  if (!isOpen) return null;

  const switchToLogin = () => setView('login');
  const switchToRegister = () => setView('register');
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className={`relative z-10 w-full max-w-md px-3 py-4 mx-4 shadow-xl animate-modalFadeIn`}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-2 right-2 p-2 rounded-full ${
            theme === 'dark' 
              ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' 
              : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'
          } transition-colors`}
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Content */}
        <div className="mt-2">
          {view === 'login' ? (
            <Login onRegisterClick={switchToRegister} />
          ) : (
            <Register onLoginClick={switchToLogin} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;