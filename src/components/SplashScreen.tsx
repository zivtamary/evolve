import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Sequence of animations
    const sequence = async () => {
      // Step 1: Show logo
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowLogo(true);
      
      // Step 2: Show app name
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowText(true);
      
      // Step 3: Show tagline
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowTagline(true);
      
      // Step 4: Hold for a moment
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Step 5: Fade out
      setFadeOut(true);
      
      // Step 6: Complete
      await new Promise(resolve => setTimeout(resolve, 800));
      onComplete();
    };
    
    sequence();
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 flex flex-col items-center justify-center z-50 transition-opacity duration-800 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ 
        background: theme === 'dark' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex flex-col items-center">
        {/* Logo */}
        <div 
          className={`transition-all duration-1000 transform ${
            showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={theme === 'dark' ? 'white' : 'black'} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="mb-6"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        
        {/* App Name */}
        <h1 
          className={`text-4xl font-bold mb-2 transition-all duration-1000 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ color: theme === 'dark' ? 'white' : 'black' }}
        >
          Evolve
        </h1>
        
        {/* Tagline */}
        <p 
          className={`text-lg transition-all duration-1000 ${
            showTagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }}
        >
          Your aesthetic productivity dashboard
        </p>
      </div>
    </div>
  );
};

export default SplashScreen; 