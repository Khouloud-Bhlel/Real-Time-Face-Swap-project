import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginProps {
  onRegisterClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onRegisterClick }) => {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-6 rounded-xl border ${
      theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-md'
    }`}>
      <h2 className={`text-2xl font-bold mb-6 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        Login
      </h2>
      
      {error && (
        <div className={`mb-4 p-3 rounded-lg flex items-center text-sm ${
          theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
        }`}>
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
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
                placeholder="you@example.com"
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`pl-10 w-full px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-purple-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500'
                } border focus:outline-none focus:ring-1 focus:ring-purple-500`}
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-500 cursor-not-allowed text-white'
                : theme === 'dark'
                  ? 'bg-purple-700 hover:bg-purple-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="text-center mt-4">
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onRegisterClick}
                className={`font-medium ${
                  theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                }`}
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;