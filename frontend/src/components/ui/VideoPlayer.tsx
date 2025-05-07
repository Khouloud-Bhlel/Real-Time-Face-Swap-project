import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const seekTime = parseFloat(e.target.value);
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div 
      className="relative w-full rounded-xl overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full rounded-xl aspect-video object-cover"
        playsInline
        onClick={togglePlay}
      />
      
      {/* Video filter overlay to simulate deepfake effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(168, 85, 247, 0.05), transparent 8%)' }}
      ></div>
      
      {/* Watermark */}
      <div className="absolute top-2 right-2 text-xs bg-black/40 text-white px-2 py-1 rounded backdrop-blur-sm">
        DeepFaceSwap AI
      </div>
      
      {/* Play/Pause overlay */}
      <div className={`
        absolute inset-0 flex items-center justify-center
        transition-opacity duration-300
        ${isPlaying && !showControls ? 'opacity-0' : 'opacity-100'}
      `}>
        <button
          onClick={togglePlay}
          className={`
            p-4 rounded-full transition-transform duration-300
            ${theme === 'dark' ? 'bg-gray-900/70' : 'bg-white/70'}
            ${isPlaying ? 'scale-75' : 'scale-100'}
            hover:scale-105
          `}
        >
          {isPlaying ? (
            <Pause className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
          ) : (
            <Play className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
          )}
        </button>
      </div>
      
      {/* Controls */}
      <div className={`
        absolute bottom-0 left-0 right-0 p-3
        transition-opacity duration-300
        ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}
        bg-gradient-to-t from-black/70 to-transparent
      `}>
        {/* Progress bar */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 rounded-full appearance-none cursor-pointer bg-gray-500"
          style={{
            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(currentTime / (duration || 1)) * 100}%, #666 ${(currentTime / (duration || 1)) * 100}%, #666 100%)`
          }}
        />
        
        {/* Controls row */}
        <div className="flex items-center justify-between mt-2 text-white">
          <div className="flex items-center space-x-4">
            <button onClick={togglePlay} className="p-1">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            
            <button onClick={toggleMute} className="p-1">
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            
            <span className="text-xs">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <button onClick={toggleFullscreen} className="p-1">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;