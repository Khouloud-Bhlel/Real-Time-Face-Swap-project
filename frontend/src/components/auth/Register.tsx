import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';

interface RegisterProps {
  onLoginClick: () => void;
}

const Register: React.FC<RegisterProps> = ({ onLoginClick }) => {
  const { register } = useAuth();
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await register(username, email, password);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-6 rounded-xl border shadow-lg ${
      theme === 'dark' 
        ? 'bg-gray-800/50 border-gray-700 shadow-gray-900/30' 
        : 'bg-white border-gray-200 shadow-gray-200/60'
    } backdrop-blur-sm`}>
      <h2 className={`text-2xl font-bold mb-6 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        Create Account
      </h2>
      
      {error && (
        <div className={`mb-4 p-3 rounded-lg flex items-center text-sm ${
          theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
        }`}>
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username input */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className={`h-5 w-5 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={`pl-10 w-full px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-purple-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
              } border focus:outline-none focus:ring-1 focus:ring-purple-500`}
              placeholder="johndoe"
            />
          </div>
        </div>

        {/* Email input */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className={`h-5 w-5 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`pl-10 w-full px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-purple-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
              } border focus:outline-none focus:ring-1 focus:ring-purple-500`}
              placeholder="your@email.com"
            />
          </div>
        </div>

        {/* Password input */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className={`h-5 w-5 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`pl-10 pr-10 w-full px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-purple-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
              } border focus:outline-none focus:ring-1 focus:ring-purple-500`}
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`focus:outline-none ${
                  theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <p className={`text-xs mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Minimum 8 characters
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className={`h-5 w-5 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`pl-10 pr-10 w-full px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-purple-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
              } border focus:outline-none focus:ring-1 focus:ring-purple-500`}
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`focus:outline-none ${
                  theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full mt-6 flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold shadow-sm transition-all ${
            theme === 'dark' 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5 mr-2" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>
      
      <div className={`mt-6 text-center text-sm ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Already have an account?{' '}
        <button
          onClick={onLoginClick}
          className={`font-semibold ${
            theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
          } transition-colors`}
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default Register;