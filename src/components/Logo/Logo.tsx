import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  // Size mappings
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const containerSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  };
  
  return (
    <div className={`flex items-center gap-2 select-none pointer-events-none ${className}`}>
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`relative ${containerSizeClasses[size]} rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-200 shadow-lg flex items-center justify-center`}
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className={`${sizeClasses[size]} text-white dark:text-gray-900`} />
          </motion.div>
          {/* Enhanced Sparkles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.15,
                repeat: Infinity,
                repeatDelay: 1.5
              }}
              className={`absolute rounded-full ${
                i === 0 ? "w-1 h-1 bg-white" :
                i === 1 ? "w-0.5 h-0.5 bg-white/90" :
                i === 2 ? "w-0.5 h-0.5 bg-white/80" :
                "w-0.5 h-0.5 bg-white/70"
              }`}
              style={{
                top: i === 0 ? '-30%' : 
                      i === 1 ? '30%' : 
                      i === 2 ? '-20%' :
                      i === 3 ? '20%' : '-10%',
                left: i === 0 ? '80%' : 
                       i === 1 ? '90%' : 
                       i === 2 ? '70%' :
                       i === 3 ? '85%' : '75%',
              }}
            />
          ))}
        </motion.div>
      </div>
      <span className={`font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
        Evolve
      </span>
    </div>
  );
};

export default Logo;