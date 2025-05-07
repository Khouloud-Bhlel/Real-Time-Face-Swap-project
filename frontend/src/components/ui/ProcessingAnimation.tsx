import React, { useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeContext';

interface ProcessingAnimationProps {
  progress: number;
}

const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({ progress }) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw progress bar background
    const barHeight = 10;
    const barY = canvas.height - barHeight - 20;
    
    ctx.fillStyle = theme === 'dark' ? '#374151' : '#e5e7eb';
    ctx.roundRect(10, barY, canvas.width - 20, barHeight, 5);
    ctx.fill();
    
    // Draw progress bar fill
    const fillWidth = (canvas.width - 20) * (progress / 100);
    const gradient = ctx.createLinearGradient(10, 0, fillWidth + 10, 0);
    
    if (theme === 'dark') {
      gradient.addColorStop(0, '#9333ea');
      gradient.addColorStop(1, '#3b82f6');
    } else {
      gradient.addColorStop(0, '#a855f7');
      gradient.addColorStop(1, '#3b82f6');
    }
    
    ctx.fillStyle = gradient;
    ctx.roundRect(10, barY, fillWidth, barHeight, 5);
    ctx.fill();
    
    // Draw AI processing visualization above the progress bar
    drawAIProcessingEffect(ctx, canvas.width / 2, canvas.height / 2 - 20, progress);
    
  }, [progress, theme]);
  
  const drawAIProcessingEffect = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    progress: number
  ) => {
    // Create a neural network-like visualization
    const networkRadius = 80;
    const nodeRadius = 4;
    const nodeCount = 16;
    
    // Draw connecting lines
    for (let i = 0; i < nodeCount; i++) {
      const angle1 = (i / nodeCount) * Math.PI * 2;
      const x1 = centerX + Math.cos(angle1) * networkRadius;
      const y1 = centerY + Math.sin(angle1) * networkRadius;
      
      // Connect to center
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(centerX, centerY);
      ctx.strokeStyle = theme === 'dark' 
        ? 'rgba(147, 51, 234, 0.2)' 
        : 'rgba(168, 85, 247, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Connect to adjacent nodes
      for (let j = 1; j < 3; j++) {
        const angle2 = ((i + j) % nodeCount / nodeCount) * Math.PI * 2;
        const x2 = centerX + Math.cos(angle2) * networkRadius;
        const y2 = centerY + Math.sin(angle2) * networkRadius;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = theme === 'dark' 
          ? 'rgba(147, 51, 234, 0.1)' 
          : 'rgba(168, 85, 247, 0.1)';
        ctx.stroke();
      }
    }
    
    // Draw data packets moving along the lines
    const activeNodeCount = Math.floor((progress / 100) * nodeCount) + 1;
    
    for (let i = 0; i < activeNodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const offsetProgress = (progress + i * 10) % 100;
      const t = offsetProgress / 100;
      
      // Lerp from outer node to center
      const x = centerX + Math.cos(angle) * networkRadius * (1 - t);
      const y = centerY + Math.sin(angle) * networkRadius * (1 - t);
      
      // Draw moving data packet
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius * 0.8, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, nodeRadius * 0.8);
      
      if (theme === 'dark') {
        gradient.addColorStop(0, 'rgba(167, 139, 250, 1)');
        gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(139, 92, 246, 1)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // Draw nodes
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * networkRadius;
      const y = centerY + Math.sin(angle) * networkRadius;
      
      const isActive = i < activeNodeCount;
      
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = isActive
        ? theme === 'dark' ? '#9333ea' : '#a855f7'
        : theme === 'dark' ? '#4b5563' : '#d1d5db';
      ctx.fill();
    }
    
    // Draw center node
    ctx.beginPath();
    ctx.arc(centerX, centerY, nodeRadius * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'dark' ? '#3b82f6' : '#3b82f6';
    ctx.fill();
    
    // Draw pulsating effect for center node
    const pulseRadius = nodeRadius * 3 + Math.sin(Date.now() * 0.005) * nodeRadius;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
    
    if (theme === 'dark') {
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    }
    
    ctx.fillStyle = gradient;
    ctx.fill();
  };
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-40"
    />
  );
};

export default ProcessingAnimation;