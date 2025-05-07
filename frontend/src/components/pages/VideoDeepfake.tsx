import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { ArrowRight, Download, Image, RefreshCw, RotateCcw, Video, AlertCircle } from 'lucide-react';
import ReferenceImagePanel from '../ui/ReferenceImagePanel';
import VideoUploader from '../ui/VideoUploader';
import ProcessingAnimation from '../ui/ProcessingAnimation';
import VideoPlayer from '../ui/VideoPlayer';
import axios from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Define TypeScript interfaces for API responses
interface VideoProcessTaskResponse {
  status: string;
  task_id: string;
  message: string;
}

interface TaskResult {
  download_url: string;
  streaming_url: string;
}

interface TaskStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: TaskResult;
  error?: string;
}

interface VideoDeepfakeProps {
  onSwitchMode: () => void;
}

const VideoDeepfake: React.FC<VideoDeepfakeProps> = ({ onSwitchMode }) => {
  const { theme } = useTheme();
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [, setVideoFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [, setTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (imageUrl: string) => {
    setReferenceImage(imageUrl);
    setCurrentStep(2);
  };

  const handleVideoSelect = (videoUrl: string) => {
    setVideoFile(videoUrl);
    setCurrentStep(3);
    // Start actual processing with the API
    startProcessing(videoUrl);
  };

  // Function to convert a URL to a File object
  const urlToFile = async (url: string, filename: string, mimeType: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: mimeType });
  };

  const startProcessing = async (videoUrl: string) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);

    try {
      // Convert reference image and video URL to File objects
      const sourceImageFile = await urlToFile(referenceImage!, 'source_image.jpg', 'image/jpeg');
      const targetVideoFile = await urlToFile(videoUrl, 'target_video.mp4', 'video/mp4');

      // Create form data for API request
      const formData = new FormData();
      formData.append('source_img', sourceImageFile);
      formData.append('target_video', targetVideoFile);

      // Send the processing request to the API
      const response = await axios.post<VideoProcessTaskResponse>(`${API_BASE_URL}/swap/video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Get task ID from response
      if (response.data && response.data.task_id) {
        setTaskId(response.data.task_id);
        // Start polling for task status
        pollTaskStatus(response.data.task_id);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error starting video processing:', err);
      setError('Failed to start processing. Please try again.');
      setIsProcessing(false);
    }
  };

  const pollTaskStatus = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get<TaskStatusResponse>(`${API_BASE_URL}/status/${taskId}`);

        if (response.data.status === 'completed') {
          clearInterval(interval);
          setIsProcessing(false);
          setProcessingProgress(100);

          // Set processed video URL for preview
          if (response.data.result && response.data.result.streaming_url) {
            setProcessedVideo(`${API_BASE_URL}${response.data.result.streaming_url}`);
          }

          // Set download URL
          if (response.data.result && response.data.result.download_url) {
            setDownloadUrl(`${API_BASE_URL}${response.data.result.download_url}`);
          }

          setCurrentStep(4);
        } else if (response.data.status === 'processing') {
          setProcessingProgress(response.data.progress || 0);
        } else if (response.data.status === 'failed') {
          clearInterval(interval);
          setIsProcessing(false);
          setError(response.data.error || 'Processing failed');
        }
      } catch (err) {
        console.error('Error checking task status:', err);
        // Don't clear interval, we'll try again
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  };

  const handleDownload = () => {
    // If we have a download URL, open it in a new tab
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  // Reset all states
  const resetProcess = () => {
    setReferenceImage(null);
    setVideoFile(null);
    setProcessedVideo(null);
    setDownloadUrl(null);
    setIsProcessing(false);
    setProcessingProgress(0);
    setCurrentStep(1);
    setTaskId(null);
    setError(null);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          One-Click Video Deepfake
        </h1>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
          Upload a single photo and target video to create a seamless deepfake
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex justify-center mb-10">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-medium
              transition-all duration-300 text-sm
              ${currentStep >= step
                ? theme === 'dark'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-800 text-gray-400'
                  : 'bg-gray-200 text-gray-500'
              }
            `}>
              {step}
            </div>

            {step < 4 && (
              <div className={`
                w-16 h-1 transition-all duration-300
                ${currentStep > step
                  ? theme === 'dark'
                    ? 'bg-purple-600'
                    : 'bg-purple-500'
                  : theme === 'dark'
                    ? 'bg-gray-800'
                    : 'bg-gray-200'
                }
              `}></div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left side - Controls and inputs */}
        <div>
          {currentStep === 1 && (
            <div className={`
              p-6 rounded-xl border-2 border-dashed mb-4
              ${theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900 shadow-md'
              }
            `}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Image className="h-5 w-5" />
                Step 1: Select Reference Image
              </h2>
              <ReferenceImagePanel
                onImageSelect={handleImageSelect}
                selectedImage={referenceImage}
              />
            </div>
          )}

          {currentStep >= 2 && (
            <div className={`
              p-6 rounded-xl border mb-4 transition-all duration-300
              ${theme === 'dark'
                ? currentStep === 2
                  ? 'bg-gray-800/50 border-2 border-dashed border-gray-700'
                  : 'bg-gray-800/20 border-gray-800'
                : currentStep === 2
                  ? 'bg-white border-2 border-dashed border-gray-300 shadow-md'
                  : 'bg-gray-50 border-gray-200'
              }
            `}>
              <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                currentStep > 2 && (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')
              }`}>
                <Video className="h-5 w-5" />
                Step 2: Upload Target Video
              </h2>

              {currentStep === 2 ? (
                <VideoUploader onVideoSelect={handleVideoSelect} />
              ) : (
                <div className={`
                  text-sm py-2 px-3 rounded
                  ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}
                `}>
                  Video uploaded successfully
                </div>
              )}
            </div>
          )}

          {currentStep >= 3 && (
            <div className={`
              p-6 rounded-xl border mb-4 transition-all duration-300
              ${theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200 shadow-md'
              }
            `}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <RefreshCw className={`h-5 w-5 ${isProcessing ? 'animate-spin' : ''}`} />
                {currentStep === 3 ? 'Step 3: Processing Video' : 'Processing Complete'}
              </h2>

              {isProcessing ? (
                <div>
                  <ProcessingAnimation progress={processingProgress} />
                  <p className={`text-center mt-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    AI is working its magic... {processingProgress}%
                  </p>
                </div>
              ) : currentStep === 4 ? (
                <div className={`
                  text-sm py-2 px-3 rounded flex items-center gap-2
                  ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}
                `}>
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Processing complete! Your deepfake video is ready.
                </div>
              ) : error ? (
                <div className={`
                  text-sm py-2 px-3 rounded flex items-center gap-2
                  ${theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'}
                `}>
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              ) : null}
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={resetProcess}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }
              `}
            >
              <RotateCcw className="h-5 w-5" />
              Start Over
            </button>

            {currentStep === 4 && (
              <button
                onClick={handleDownload}
                disabled={!downloadUrl}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${!downloadUrl
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : theme === 'dark'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }
                `}
              >
                <Download className="h-5 w-5" />
                Download Video
              </button>
            )}

            <button
              onClick={onSwitchMode}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
                }
              `}
            >
              Switch to Real-Time
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right side - Preview area */}
        <div>
          <div className={`
            p-6 rounded-xl h-full flex flex-col
            ${theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white shadow-md'
            }
          `}>
            <h2 className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Preview
            </h2>

            <div className="flex-1 flex items-center justify-center">
              {processedVideo ? (
                <VideoPlayer videoUrl={processedVideo} />
              ) : (
                <div className={`
                  text-center p-10 rounded-lg border-2 border-dashed w-full h-64 flex flex-col items-center justify-center
                  ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-500'
                  }
                `}>
                  {currentStep === 1 && "Select a reference image to get started"}
                  {currentStep === 2 && "Now upload a target video"}
                  {currentStep === 3 && "Processing your video..."}
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className={`
              mt-4 text-xs p-2 rounded
              ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}
            `}>
              <strong>Disclaimer:</strong> For entertainment purposes only. Do not use to create misleading or harmful content.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDeepfake;
