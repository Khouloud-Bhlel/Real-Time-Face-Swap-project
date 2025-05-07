import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { SlidersHorizontal, Video, ArrowRight } from 'lucide-react';
import WebcamPreview from '../ui/WebcamPreview';
import ReferenceImagePanel from '../ui/ReferenceImagePanel';
import AdjustmentsPanel from '../ui/AdjustmentsPanel';
import BeforeAfterSlider from '../ui/BeforeAfterSlider';

// API endpoint (adjust based on your actual backend URL)
const API_URL = 'http://localhost:8000/api/v1';

// Set this to true only during development
const DEV_MODE = false;

interface FaceSwapStudioProps {
  onSwitchMode: () => void;
}

const FaceSwapStudio: React.FC<FaceSwapStudioProps> = ({ onSwitchMode }) => {
  const { theme } = useTheme();
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [targetImage, setTargetImage] = useState<string | null>(null);
  const [swappedImage, setSwappedImage] = useState<string | null>(null);
  const [adjustmentsVisible, setAdjustmentsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Default target image for swapping when no webcam is used - using a local image instead of remote URL
  const defaultTargetImage = "/sample-faces/face1.jpg";

  // Helper function to convert data URL to File object
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    try {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (e) {
      console.error("Error converting data URL to file:", e);
      throw e;
    }
  };

  // Helper function to fetch an image and convert to blob
  const fetchImageAsBlob = async (imageUrl: string): Promise<Blob> => {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    return await response.blob();
  };

  // Helper function to log debug information
  const logDebug = (message: string) => {
    console.log(message);
    if (DEV_MODE) {
      setDebugInfo(prev => `${prev || ''}${message}\n`);
    }
  };

  const handleImageSelect = async (imageUrl: string) => {
    setReferenceImage(imageUrl);
    setDebugInfo(null);

    if (!imageUrl) {
      setShowBeforeAfter(false);
      setSwappedImage(null);
      return;
    }

    // Set a default target image if not using webcam
    const targetImg = targetImage || defaultTargetImage;
    setTargetImage(targetImg);

    // Start processing
    setIsProcessing(true);
    setError(null);

    try {
      // Create form data for API request
      const formData = new FormData();

      let sourceFile: File | undefined;
      let targetFile: File | undefined;

      // Handle source image
      try {
        // Try to use it as a data URL if it starts with data:
        if (imageUrl.startsWith('data:')) {
          sourceFile = dataURLtoFile(imageUrl, "source_image.jpg");
        } else {
          // Otherwise, fetch the image directly
          const sourceResponse = await fetch(imageUrl);
          if (!sourceResponse.ok) throw new Error(`Failed to fetch source image: ${sourceResponse.status}`);
          const sourceBlob = await sourceResponse.blob();
          sourceFile = new File([sourceBlob], "source_image.jpg", { type: sourceBlob.type || 'image/jpeg' });
        }

        // Log for debugging
        logDebug(`Source file: ${sourceFile?.size ?? 'unknown'} bytes`);
      } catch (error) {
        console.error("Error creating source file:", error);
        throw new Error(`Failed to process source image: ${(error as Error).message}`);
      }

      // Handle target image
      try {
        if (targetImg.startsWith('data:')) {
          targetFile = dataURLtoFile(targetImg, "target_image.jpg");
        } else {
          // Otherwise, fetch the image directly
          const targetResponse = await fetch(targetImg);
          if (!targetResponse.ok) throw new Error(`Failed to fetch target image: ${targetResponse.status}`);
          const targetBlob = await targetResponse.blob();
          targetFile = new File([targetBlob], "target_image.jpg", { type: targetBlob.type || 'image/jpeg' });
        }

        // Log for debugging
        logDebug(`Target file: ${targetFile?.size ?? 'unknown'} bytes`);
      } catch (error) {
        console.error("Error creating target file:", error);
        throw new Error(`Failed to process target image: ${(error as Error).message}`);
      }

      // Add files to form data
      formData.append('source_img', sourceFile);
      formData.append('target_img', targetFile);
      formData.append('enhance_result', 'true');
      formData.append('add_watermark', 'false'); // No watermark for preview

      // Log for debugging
      logDebug(`Sending request to: ${API_URL}/swap/face`);

      // Call the backend API to perform face swapping
      const response = await fetch(`${API_URL}/swap/face`, {
        method: 'POST',
        body: formData,
      });

      logDebug(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText };
        }

        throw new Error(errorData?.detail || `Error: ${response.status} ${response.statusText}`);
      }

      // Create an object URL from the blob response
      const resultBlob = await response.blob();
      logDebug(`Result: ${resultBlob.size} bytes, type: ${resultBlob.type}`);

      const resultUrl = URL.createObjectURL(resultBlob);

      // Use the swapped image from the API response
      setSwappedImage(resultUrl);
      setShowBeforeAfter(true);
    } catch (error) {
      console.error('Error during face swap:', error);
      setError(`${(error as Error).message}`);
      logDebug(`Error: ${(error as Error).message}`);

      // Fallback: show before/after with original images for demo purposes
      setSwappedImage(targetImg);
      setShowBeforeAfter(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWebcamImageCapture = async (img: string) => {
    setTargetImage(img);
    if (referenceImage) {
      // If we already have a reference image, process the new target
      await processSwap(referenceImage, img);
    }
  };

  const processSwap = async (sourceUrl: string, targetUrl: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Create form data for API request
      const formData = new FormData();

      // Convert source URL to File
      let sourceFile;
      if (sourceUrl.startsWith('data:')) {
        sourceFile = dataURLtoFile(sourceUrl, "source_image.jpg");
      } else {
        const sourceBlob = await fetchImageAsBlob(sourceUrl);
        sourceFile = new File([sourceBlob], "source_image.jpg", { type: sourceBlob.type });
      }

      // Convert target URL to File (usually from webcam, so data URL)
      let targetFile;
      if (targetUrl.startsWith('data:')) {
        targetFile = dataURLtoFile(targetUrl, "target_image.jpg");
      } else {
        const targetBlob = await fetchImageAsBlob(targetUrl);
        targetFile = new File([targetBlob], "target_image.jpg", { type: targetBlob.type });
      }

      // Add files to form data
      formData.append('source_img', sourceFile);
      formData.append('target_img', targetFile);
      formData.append('enhance_result', 'true');
      formData.append('add_watermark', 'false');

      // Call the backend API
      const response = await fetch(`${API_URL}/swap/face`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Error: ${response.status} ${response.statusText}`);
      }

      // Create an object URL from the blob response
      const resultBlob = await response.blob();
      const resultUrl = URL.createObjectURL(resultBlob);

      setSwappedImage(resultUrl);
      setShowBeforeAfter(true);
    } catch (error) {
      console.error('Error during face swap:', error);
      setError((error as Error).message || 'Failed to process face swap');
      setSwappedImage(targetUrl);
      setShowBeforeAfter(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Real-Time Face Swap Studio
        </h1>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
          Choose a reference image and see the transformation happen instantly
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left panel - Reference image upload */}
        <div className={`w-full md:w-1/4 transition-all ${
          adjustmentsVisible ? 'md:w-1/5' : 'md:w-1/4'
        }`}>
          <ReferenceImagePanel
            onImageSelect={handleImageSelect}
            selectedImage={referenceImage}
          />
        </div>

        {/* Center panel - Webcam preview / face swap */}
        <div className={`w-full transition-all ${
          adjustmentsVisible ? 'md:w-2/5' : 'md:w-3/4'
        }`}>
          {showBeforeAfter ? (
            <BeforeAfterSlider
              beforeImage={targetImage || defaultTargetImage}
              afterImage={swappedImage || targetImage || defaultTargetImage}
            />
          ) : (
            <WebcamPreview
              referenceImage={referenceImage}
              isProcessing={isProcessing}
              onImageCaptured={handleWebcamImageCapture}
            />
          )}

          {/* Error message if any */}
          {error && (
            <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800'}`}>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Debug info - only shown in development mode */}
          {DEV_MODE && debugInfo && (
            <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
              <pre className="text-xs whitespace-pre-wrap font-mono">{debugInfo}</pre>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setAdjustmentsVisible(!adjustmentsVisible)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }
              `}
            >
              <SlidersHorizontal className="h-5 w-5" />
              {adjustmentsVisible ? 'Hide' : 'Show'} Adjustments
            </button>

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
              <Video className="h-5 w-5" />
              Switch to Video Mode
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right panel - Adjustments when visible */}
        {adjustmentsVisible && (
          <div className="w-full md:w-2/5">
            <AdjustmentsPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceSwapStudio;
