import React, { useEffect, useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { ChevronRight, Shield, Zap, UploadCloud } from 'lucide-react';
import WebcamPreview from '../ui/WebcamPreview';
import ParticleAnimation from '../ui/ParticleAnimation';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { theme } = useTheme();
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Show animation after a small delay
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Face Swap',
      description: 'Instant face swapping with live webcam feed and smooth, realistic results.',
    },
    {
      icon: UploadCloud,
      title: 'One-Click Deepfake',
      description: 'Transform any video with just a single reference photo in seconds.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Local processing means your media never leaves your device.',
    },
  ];

  return (
    <div className="pt-20">
      <div className="relative overflow-hidden">
        {/* Hero section with webcam preview */}
        <div className={`relative z-10 py-10 md:py-20 px-4 text-center ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 transition-all 
            ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            duration-700 ease-out
          `}>
            Transform Faces in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Real-Time</span>
          </h1>
          
          <p className={`text-lg md:text-xl mb-8 max-w-3xl mx-auto transition-all 
            ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
            duration-700 delay-100 ease-out
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
          `}>
            Create stunning deepfakes with just one click. Our AI-powered face swap technology 
            delivers high-quality results instantly, no technical skills required.
          </p>
          
          <button 
            onClick={onGetStarted}
            className={`
              px-8 py-4 rounded-full text-white font-medium flex items-center gap-2 mx-auto
              bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700
              transition-all duration-300 shadow-lg hover:shadow-purple-500/20
              ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
              duration-500 delay-200 ease-out
            `}
          >
            Try It Now <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Interactive webcam demo */}
        <div className={`
          max-w-4xl mx-auto mt-4 mb-10 transition-all duration-700 delay-300 ease-out
          ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        `}>
          <WebcamPreview />
        </div>

        {/* Background particles */}
        <div className="absolute inset-0 pointer-events-none">
          <ParticleAnimation theme={theme} />
        </div>
      </div>

      {/* Features section */}
      <div className={`
        py-16 grid md:grid-cols-3 gap-8 px-4 transition-all duration-700 delay-500
        ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
      `}>
        {features.map((feature, index) => (
          <div 
            key={index}
            className={`
              p-6 rounded-xl transition-all duration-500 
              ${theme === 'dark' 
                ? 'bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700' 
                : 'bg-white hover:bg-blue-50 shadow-md hover:shadow-lg'
              }
            `}
          >
            <div className={`
              p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4
              ${theme === 'dark' 
                ? 'bg-purple-900/50 text-purple-400' 
                : 'bg-purple-100 text-purple-600'
              }
            `}>
              <feature.icon className="h-7 w-7" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {feature.title}
            </h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className={`
        text-center py-10 transition-all duration-700 delay-600
        ${showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
      `}>
        <button 
          onClick={onGetStarted}
          className={`
            px-8 py-3 rounded-full font-medium 
            ${theme === 'dark' 
              ? 'bg-white text-gray-900 hover:bg-gray-100' 
              : 'bg-gray-900 text-white hover:bg-gray-800'
            }
            transition-all duration-300
          `}
        >
          Get Started Now
        </button>
      </div>
    </div>
  );
};

export default LandingPage;