import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ParticlesAnimationProps {
  isVisible?: boolean;
  duration?: number;
}

const ParticlesAnimation: React.FC<ParticlesAnimationProps> = ({ 
  isVisible = true, 
  duration = 5000 
}) => {
  const [showParticles, setShowParticles] = useState(true);
  const [hasShownParticles, setHasShownParticles] = useState(false);

  useEffect(() => {
    if (isVisible && showParticles && !hasShownParticles) {
      const timer = setTimeout(() => {
        setShowParticles(false);
        setHasShownParticles(true);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, showParticles, hasShownParticles, duration]);

  if (!isVisible || !showParticles) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
      {Array.from({ length: 40 }).map((_, i) => {
        // Generate random starting positions
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        
        // Generate random end positions
        const endX = Math.random() * window.innerWidth;
        const endY = Math.random() * window.innerHeight;
        
        return (
          <motion.div
            key={i}
            initial={{ 
              scale: 0,
              opacity: 0,
              x: startX,
              y: startY
            }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0],
              x: endX,
              y: endY
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: i * 0.05,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className={`absolute rounded-full ${
              i % 3 === 0 
                ? "w-1.5 h-1.5 bg-white" 
                : i % 3 === 1 
                  ? "w-1 h-1 bg-white/80" 
                  : "w-0.5 h-0.5 bg-white/60"
            }`}
          />
        );
      })}
    </div>
  );
};

export default ParticlesAnimation; 