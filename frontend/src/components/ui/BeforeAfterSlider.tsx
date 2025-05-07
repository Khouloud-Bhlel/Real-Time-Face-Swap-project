import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../theme/ThemeContext';

interface BeforeAfterSliderProps {
  beforeImage?: string | null;
  afterImage?: string | null;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage = "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800",
  afterImage = "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800"
}) => {
  const { theme } = useTheme();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create stable callbacks that don't change on each render
  const updateSliderPosition = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  }, []);

  const updateSliderPositionTouch = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const position = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderPosition(e);
  }, [updateSliderPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e);
    }
  }, [isDragging, updateSliderPosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    updateSliderPositionTouch(e);
  }, [updateSliderPositionTouch]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging) {
      updateSliderPositionTouch(e);
    }
  }, [isDragging, updateSliderPositionTouch]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    // Add document-level event listeners for better dragging experience
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as unknown as EventListener);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove as unknown as EventListener);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove as unknown as EventListener);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove as unknown as EventListener);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full rounded-xl overflow-hidden border aspect-video cursor-grab
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}
      `}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Before image - full width */}
      <div className="absolute top-0 left-0 w-full h-full">
        <img
          src={beforeImage ?? ''}
          alt="Before"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
          Before
        </div>
      </div>

      {/* After image - clipped by the slider position */}
      <div
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={afterImage ?? ''}
          alt="After"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 bg-purple-500/90 text-white text-xs px-2 py-1 rounded">
          After
        </div>
      </div>

      {/* Slider control */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize"
        style={{
          left: `calc(${sliderPosition}% - 0.5px)`,
          boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Slider handle */}
        <div
          className={`
            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            w-8 h-8 rounded-full flex items-center justify-center
            ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-500'}
            shadow-lg
          `}
        >
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5L2 12L8 19M16 5L22 12L16 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <div className={`
          inline-block px-3 py-1.5 rounded-full text-xs backdrop-blur-sm
          ${theme === 'dark' ? 'bg-black/70 text-white' : 'bg-white/70 text-gray-800'}
        `}>
          Drag slider to compare before & after
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
