import React from 'react';
import { motion } from 'framer-motion';
import { Image, Palette, Waves } from 'lucide-react';

type BackgroundType = 'image' | 'gradient' | 'solid';

interface BackgroundTypeToggleProps {
  currentType: BackgroundType;
  onTypeChange: (type: BackgroundType) => void;
}

const BackgroundTypeToggle: React.FC<BackgroundTypeToggleProps> = ({ currentType, onTypeChange }) => {
  const types: { type: BackgroundType; icon: React.ReactNode; label: string }[] = [
    { type: 'image', icon: <Image className="w-5 h-5" />, label: 'Image' },
    { type: 'gradient', icon: <Waves className="w-5 h-5" />, label: 'Gradient' },
    { type: 'solid', icon: <Palette className="w-5 h-5" />, label: 'Solid' }
  ];

  const handleTypeClick = (type: BackgroundType) => {
    // If clicking the same type that's already selected, switch back to image
    if (type === currentType) {
      onTypeChange('image');
    } else {
      onTypeChange(type);
    }
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      {types.map(({ type, icon, label }) => (
        <motion.button
          key={type}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTypeClick(type)}
          className={`p-2 rounded-full backdrop-blur-md transition-colors ${
            currentType === type
              ? 'bg-white/30 text-white'
              : 'bg-black/20 text-white/70 hover:bg-black/30'
          }`}
          title={`Switch to ${label} background`}
        >
          {icon}
        </motion.button>
      ))}
    </div>
  );
};

export default BackgroundTypeToggle; 