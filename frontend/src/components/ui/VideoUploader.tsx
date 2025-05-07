import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Upload, Video, FileVideo } from 'lucide-react';

interface VideoUploaderProps {
  onVideoSelect: (videoUrl: string) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelect }) => {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  
  // Sample videos (for demo purposes)
  const sampleVideos = [
    "https://assets.mixkit.co/videos/preview/mixkit-spinning-around-the-campfire-2364-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-walking-on-a-street-4440-large.mp4"
  ];
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // For this demo, we'll just use a sample video
    onVideoSelect(sampleVideos[0]);
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // For this demo, we'll just use a sample video
    onVideoSelect(sampleVideos[0]);
  };
  
  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-5 text-center transition-colors
          ${isDragging 
            ? theme === 'dark' 
              ? 'border-purple-500 bg-purple-900/20' 
              : 'border-purple-500 bg-purple-50'
            : theme === 'dark' 
              ? 'border-gray-700 hover:border-gray-500' 
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <Upload className={`h-10 w-10 mx-auto mb-3 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`} />
        
        <p className={`text-sm mb-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Drag & drop your video here
        </p>
        
        <p className={`text-xs mb-4 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Supported formats: MP4, MOV, AVI (Max 500MB)
        </p>
        
        <label className={`
          px-4 py-2 rounded-lg text-sm font-medium inline-block cursor-pointer transition-colors
          ${theme === 'dark' 
            ? 'bg-purple-700 hover:bg-purple-600 text-white' 
            : 'bg-purple-600 hover:bg-purple-700 text-white'
          }
        `}>
          Browse Files
          <input 
            type="file" 
            className="hidden" 
            accept="video/*"
            onChange={handleFileInput}
          />
        </label>
      </div>
      
      {/* Sample videos */}
      <div>
        <p className={`text-xs mb-2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Or select a sample video:
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          {sampleVideos.map((src, index) => (
            <button 
              key={index}
              onClick={() => onVideoSelect(src)}
              className={`
                relative rounded-lg overflow-hidden p-2 border
                ${theme === 'dark' 
                  ? 'border-gray-700 hover:border-gray-600 bg-gray-800' 
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <FileVideo className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <div className="text-left">
                  <span className={`text-xs font-medium block ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Sample {index + 1}
                  </span>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    10s • 720p
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;