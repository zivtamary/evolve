import { LeafIcon } from 'lucide-react';
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  // Size mappings
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };
  
  return (
    <div className={`flex items-center gap-2 select-none pointer-events-none ${className}`}>
      <div className="bg-gradient-to-r from-orange-400 to-pink-400 p-1.5 rounded-md">
       <LeafIcon className="w-4 h-4 text-white" />
      </div>
      <span className={`font-bold ${sizeClasses[size]} text-white`}>
        Evolve
      </span>
    </div>
  );
};

export default Logo;