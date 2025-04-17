import React from 'react';

interface GradientNoiseBackgroundProps {
  children: React.ReactNode;
}

const GradientNoiseBackground: React.FC<GradientNoiseBackgroundProps> = ({ 
  children
}) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-black dark:via-black dark:to-black" />
      
      {/* Enhanced radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/30 via-transparent to-transparent dark:from-transparent dark:via-transparent dark:to-transparent" />
      
      {/* Secondary radial gradient for bottom accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-transparent via-gray-100/50 to-gray-200/90 dark:from-transparent dark:via-transparent dark:to-transparent" />
      
      {/* Middle grayish accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-gray-100/40 to-transparent dark:from-transparent dark:via-transparent dark:to-transparent" />
      
      {/* Subtle color accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/95 to-blue-50/30 dark:from-transparent dark:via-white/5 dark:to-transparent" />
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(255,255,255,0.3)_100%)] dark:bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.5)_100%)]" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default GradientNoiseBackground; 