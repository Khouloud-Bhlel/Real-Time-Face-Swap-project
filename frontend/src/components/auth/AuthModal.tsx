import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { X } from 'lucide-react';
import Login from './Login';
import Register from './Register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<AuthMode>('login');

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className={`
        relative z-10 w-full max-w-md mx-auto rounded-xl overflow-hidden
        transform transition-all duration-300
        animate-fade-in animate-scale-in
      `}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`
            absolute top-4 right-4 p-2 rounded-full z-20
            ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Content */}
        {mode === 'login' ? (
          <Login onRegisterClick={() => setMode('register')} />
        ) : (
          <Register onLoginClick={() => setMode('login')} />
        )}
      </div>
    </div>
  );
};

export default AuthModal;