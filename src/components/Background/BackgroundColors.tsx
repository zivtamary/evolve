import React, { useState, useEffect, useRef } from 'react';
import { Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const pastelGradients = [
  'from-indigo-600 via-purple-600 to-pink-600',
  'from-blue-600 via-cyan-600 to-teal-600',
  'from-amber-600 via-orange-600 to-red-600',
  'from-emerald-600 via-teal-600 to-cyan-600',
  'from-violet-600 via-purple-600 to-fuchsia-600',
  'from-slate-700 via-gray-700 to-zinc-700'
];

const pastelColors = [
  'bg-indigo-700',
  'bg-blue-700',
  'bg-amber-700',
  'bg-emerald-700',
  'bg-violet-700',
  'bg-slate-800'
];

interface BackgroundColorsProps {
  type: 'gradient' | 'solid';
  onSelect: (className: string) => void;
  onReturnToImage: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const BackgroundColors: React.FC<BackgroundColorsProps> = ({ 
  type, 
  onSelect, 
  onReturnToImage, 
  isOpen, 
  onClose 
}) => {
  const colors = type === 'gradient' ? pastelGradients : pastelColors;
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Auto-close after selection
  const handleSelect = (color: string) => {
    onSelect(color);
    onClose();
  };
  
  // Auto-close after returning to image
  const handleReturnToImage = () => {
    onReturnToImage();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          ref={containerRef}
          initial={{ opacity: 0, y: 45, x: 20 }}
          animate={{ opacity: 1, y: 45, x: 20 }}
          exit={{ opacity: 0, y: 45, x: 20 }}
          transition={{ duration: 0.2 }}
          className="absolute top-4 right-20 flex flex-col gap-2 z-10"
        >
          {/* Return to image button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReturnToImage}
            className="w-8 h-8 rounded-full bg-black/20 text-white/70 hover:bg-black/30 transition-colors flex items-center justify-center"
            title="Return to image background"
          >
            <Image className="w-4 h-4" />
          </motion.button>
          
          {colors.map((color, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSelect(color)}
              className={`w-8 h-8 rounded-full ${
                type === 'gradient' ? `bg-gradient-to-br ${color}` : color
              } border-2 border-white/20 transition-transform`}
              title={`Select ${type} ${index + 1}`}
              initial={{ opacity: index === 0 ? 1 : 0 }}
              animate={{ opacity: 1}}
              transition={{ delay: index * 0.05 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackgroundColors; 