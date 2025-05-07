import React, { useState, useRef } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { Upload, Image, UserCheck, X } from 'lucide-react';

interface ReferenceImagePanelProps {
  onImageSelect: (imageUrl: string) => void;
  selectedImage: string | null;
}

const ReferenceImagePanel: React.FC<ReferenceImagePanelProps> = ({
  onImageSelect,
  selectedImage
}) => {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use locally stored sample images instead of external URLs
  const sampleImages = [
    "/sample-faces/face1.jpg",
    "/sample-faces/face2.jpg",
    "/sample-faces/face3.jpg",
    "/sample-faces/face4.jpg"
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

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageSelect(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageSelect(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedImage = () => {
    onImageSelect("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`
      p-4 rounded-xl border h-full
      ${theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200 shadow-sm'
      }
    `}>
      <h3 className={`text-lg font-semibold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        Reference Image
      </h3>

      {selectedImage ? (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Reference"
              className="w-full rounded-lg object-cover aspect-square"
            />
            <button
              onClick={clearSelectedImage}
              className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"
              aria-label="Clear image"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
              <UserCheck className="h-3 w-3" />
              <span>Face detected</span>
            </div>
          </div>

          <button
            onClick={clearSelectedImage}
            className={`
              w-full py-2 rounded text-sm font-medium transition-colors
              ${theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
          >
            Change Image
          </button>
        </div>
      ) : (
        <>
          {/* Upload area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-5 text-center mb-6 transition-colors
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
              Drag & drop your image here
            </p>

            <p className={`text-xs mb-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              or
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
                accept="image/*"
                onChange={handleFileInput}
                ref={fileInputRef}
              />
            </label>
          </div>

          {/* Sample images */}
          <div>
            <p className={`text-xs mb-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Or select a sample image:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {sampleImages.map((src, index) => (
                <button
                  key={index}
                  onClick={() => onImageSelect(src)}
                  className="relative rounded-lg overflow-hidden"
                >
                  <img
                    src={src}
                    alt={`Sample ${index + 1}`}
                    className="w-full aspect-square object-cover hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <Image className="h-5 w-5 text-white" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReferenceImagePanel;
