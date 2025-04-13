import React, { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  children: React.ReactNode;
  videoPath: string;
}

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ children, videoPath }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={`/backgrounds/dynamic/${videoPath}`} type="video/mp4" />
      </video>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/30" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default BackgroundVideo; 