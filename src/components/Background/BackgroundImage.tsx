import React, { useEffect, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface BackgroundImageProps {
  children: React.ReactNode;
  blurLevel?: number;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({ 
  children,
  blurLevel = 2
}) => {
  const [imageUrl, setImageUrl] = useLocalStorage<string>('background-image', '');
  const [lastUsedIndex, setLastUsedIndex] = useLocalStorage<number>('last-image-index', -1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const defaultImages = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    'https://images.unsplash.com/photo-1511300636408-a63a89df3482',
  ];

  const getNewRandomImage = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * defaultImages.length);
    } while (newIndex === lastUsedIndex && defaultImages.length > 1);
    
    setLastUsedIndex(newIndex);
    return defaultImages[newIndex];
  };

  useEffect(() => {
    const fetchRandomImage = async () => {
      try {
        setLoading(true);
        
        if (!imageUrl) {
          const newImageUrl = getNewRandomImage();
          setImageUrl(newImageUrl);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching background image:', error);
        setLoading(false);
      }
    };

    fetchRandomImage();
  }, [imageUrl, setImageUrl]);

  const handleRefreshBackground = () => {
    setIsSpinning(true);
    const newImageUrl = getNewRandomImage();
    setImageUrl(newImageUrl);
    // Stop spinning after the background change animation completes
    setTimeout(() => {
      setIsSpinning(false);
    }, 1000);
  };

  // Calculate blur value based on blur level
  const getBlurValue = () => {
    switch (blurLevel) {
      case 0: return '0px'; // None
      case 1: return '4px'; // Low
      case 2: return '8px'; // High
      default: return '8px';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background image with blur effect */}
      <div
        className={`absolute inset-0 size-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          !loading ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          filter: `blur(${getBlurValue()})`,
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/70" />
      
      {/* Gradient overlay for galaxy effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80 dark:from-transparent dark:via-black/50 dark:to-black/90" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
        
        {/* Refresh button */}
        <button 
          onClick={handleRefreshBackground}
          className={`absolute bottom-4 right-4 rounded-full bg-black/40 p-2 text-white backdrop-blur-md hover:bg-black/60 ${isSpinning ? 'animate-spin' : ''}`}
          title="Refresh Background"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BackgroundImage;
