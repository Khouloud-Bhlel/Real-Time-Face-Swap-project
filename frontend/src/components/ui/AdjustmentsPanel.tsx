import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { SlidersHorizontal, Zap, Sparkles, Blend } from 'lucide-react';

const AdjustmentsPanel: React.FC = () => {
  const { theme } = useTheme();
  const [blending, setBlending] = useState(75);
  const [sharpness, setSharpness] = useState(50);
  const [lighting, setLighting] = useState(60);
  const [enhancementMode, setEnhancementMode] = useState<'standard' | 'high' | 'cinematic'>('standard');
  
  return (
    <div className={`
      p-4 rounded-xl border h-full
      ${theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200 shadow-sm'
      }
    `}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        <SlidersHorizontal className="h-5 w-5" />
        Adjustments
      </h3>
      
      <div className="space-y-6">
        {/* Blending slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Blend className="h-4 w-4 inline mr-1" /> Blending
            </label>
            <span className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>{blending}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={blending}
            onChange={(e) => setBlending(parseInt(e.target.value))}
            className={`w-full h-2 rounded-full appearance-none cursor-pointer ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}
            style={{
              background: `linear-gradient(to right, ${
                theme === 'dark' ? '#9333ea' : '#a855f7'
              } 0%, ${
                theme === 'dark' ? '#9333ea' : '#a855f7'
              } ${blending}%, ${
                theme === 'dark' ? '#374151' : '#e5e7eb'
              } ${blending}%, ${
                theme === 'dark' ? '#374151' : '#e5e7eb'
              } 100%)`
            }}
          />
          <p className={`text-xs mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Controls how much of the original face is retained
          </p>
        </div>
        
        {/* Sharpness slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Zap className="h-4 w-4 inline mr-1" /> Sharpness
            </label>
            <span className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>{sharpness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sharpness}
            onChange={(e) => setSharpness(parseInt(e.target.value))}
            className={`w-full h-2 rounded-full appearance-none cursor-pointer ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}
            style={{
              background: `linear-gradient(to right, ${
                theme === 'dark' ? '#3b82f6' : '#3b82f6'
              } 0%, ${
                theme === 'dark' ? '#3b82f6' : '#3b82f6'
              } ${sharpness}%, ${
                theme === 'dark' ? '#374151' : '#e5e7eb'
              } ${sharpness}%, ${
                theme === 'dark' ? '#374151' : '#e5e7eb'
              } 100%)`
            }}
          />
          <p className={`text-xs mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Enhances clarity and detail of facial features
          </p>
        </div>
        
        {/* Lighting slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Sparkles className="h-4 w-4 inline mr-1" /> Lighting Match
            </label>
            <span className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>{lighting}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={lighting}
            onChange={(e) => setLighting(parseInt(e.target.value))}
            className={`w-full h-2 rounded-full appearance-none cursor-pointer ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}
            style={{
              background: `linear-gradient(to right, ${
                theme === 'dark' ? '#f59e0b' : '#f59e0b'
              } 0%, ${
                theme === 'dark' ? '#f59e0b' : '#f59e0b'
              } ${lighting}%, ${
                theme === 'dark' ? '#374151' : '#e5e7eb'
              } ${lighting}%, ${
                theme === 'dark' ? '#374151' : '#e5e7eb'
              } 100%)`
            }}
          />
          <p className={`text-xs mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Matches lighting between source and target face
          </p>
        </div>
        
        {/* Enhancement mode */}
        <div>
          <label className={`text-sm font-medium block mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Enhancement Mode
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            {['standard', 'high', 'cinematic'].map((mode) => (
              <button
                key={mode}
                onClick={() => setEnhancementMode(mode as any)}
                className={`
                  py-2 px-3 text-xs font-medium rounded transition-colors
                  ${enhancementMode === mode
                    ? theme === 'dark'
                      ? 'bg-purple-700 text-white'
                      : 'bg-purple-600 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          <p className={`text-xs mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {enhancementMode === 'standard' && 'Balanced quality and performance'}
            {enhancementMode === 'high' && 'Higher quality with more processing time'}
            {enhancementMode === 'cinematic' && 'Movie-quality results with longest processing'}
          </p>
        </div>
        
        {/* Apply button */}
        <button
          className={`
            w-full py-3 rounded-lg text-sm font-medium transition-colors mt-4
            ${theme === 'dark' 
              ? 'bg-purple-700 hover:bg-purple-600 text-white' 
              : 'bg-purple-600 hover:bg-purple-700 text-white'
            }
          `}
        >
          Apply Settings
        </button>
      </div>
    </div>
  );
};

export default AdjustmentsPanel;