import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  // Size mappings
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  return (
    <div className={`flex items-center gap-2 select-none pointer-events-none ${className}`}>
      <img 
        src="/icons/icon-128.png" 
        alt="Evolve - Aesthetic Startpage Logo"
        className={`${sizeClasses[size]} object-contain`}
      />
      <span className={`font-semibold text-black dark:text-white ${textSizeClasses[size]}`}>
        Evolve
      </span>
    </div>
  );
};

export default Logo;