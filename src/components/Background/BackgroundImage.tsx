
import React, { useEffect, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface BackgroundImageProps {
  children: React.ReactNode;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({ children }) => {
  const [imageUrl, setImageUrl] = useLocalStorage<string>('background-image', '');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRandomImage = async () => {
      try {
        setLoading(true);
        // For now, we'll use a predefined Unsplash URL until we integrate the API
        const defaultImages = [
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
          'https://images.unsplash.com/photo-1511300636408-a63a89df3482',
          'https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe',
        ];
        
        if (!imageUrl) {
          const randomIndex = Math.floor(Math.random() * defaultImages.length);
          setImageUrl(defaultImages[randomIndex]);
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
    setImageUrl('');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image with blur effect */}
      {!loading && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url(${imageUrl})`,
            filter: 'blur(8px)',
            transform: 'scale(1.1)',
          }}
        />
      )}
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
        
        {/* Refresh button */}
        <button 
          onClick={handleRefreshBackground}
          className="absolute bottom-4 right-4 rounded-full bg-black/20 p-2 text-white backdrop-blur-md hover:bg-black/30"
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
