import React from 'react';
import { Sun, Moon, Coffee, Bed, MoonStarIcon, SunDim, Star, Cloud } from 'lucide-react';
import type { Variants } from 'framer-motion';
import { motion, useAnimation } from 'framer-motion';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { cn } from '@/lib/utils';


const FloatingStar = ({ delay, size, x, y }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      x: [x, x + 10, x],
      y: [y, y - 10, y]
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute"
  >
    <Star className={`${size} fill-white/20 text-white/10`} style={{
      filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))'
    }} />
  </motion.div>
);

const FloatingCloud = ({ delay, size, x, y }) => (
  <motion.div
    initial={{ opacity: 0, x: x - 20 }}
    animate={{ 
      opacity: [0, 0.3, 0],
      x: [x - 20, x + 20, x + 40]
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute"
  >
    <Cloud className={`${size} fill-white/10 text-white/5`} style={{
      filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.2))'
    }} />
  </motion.div>
);

const FloatingZ = ({ delay, x, y, size }) => (
  <motion.div
    initial={{ opacity: 0, y: y }}
    animate={{ 
      opacity: [0, 1, 0],
      y: [y, y - 10, y]
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute text-white/70 font-bold"
    style={{
      fontSize: size,
      left: x,
      top: y,
      filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.3))'
    }}
  >
    z
  </motion.div>
);

const TimeGreeting = () => {
  const getGreetingAndIcon = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return {
        greeting: "Good morning, Ziv.",
        icon: (
          <div className="relative">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <SunDim className="size-12 fill-amber-300 text-amber-200 drop-shadow-lg" style={{
                filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.4)) drop-shadow(0 0 20px rgba(251, 191, 36, 0.2))'
              }} />
            </motion.div>
            <FloatingCloud delay={0} size="size-6" x={-15} y={-10} />
            <FloatingCloud delay={1} size="size-4" x={20} y={-5} />
          </div>
        )
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: "Good afternoon, Ziv.",
        icon: (
          <div className="relative">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sun className="size-12 fill-yellow-400 text-yellow-400 drop-shadow-lg" style={{
                filter: 'drop-shadow(0 0 12px rgba(251, 146, 60, 0.4)) drop-shadow(0 0 20px rgba(251, 146, 60, 0.2))'
              }} />
            </motion.div>
            <FloatingCloud delay={0.5} size="size-5" x={-20} y={-8} />
            <FloatingCloud delay={1.5} size="size-3" x={15} y={-3} />
          </div>
        )
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        greeting: "Good evening, Ziv.",
        icon: (
          <div className="relative">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
              filter: 'drop-shadow(0 0 10px rgba(167, 139, 250, 0.5)) drop-shadow(0 0 15px rgba(79, 70, 229, 0.3))'
            }}>
              <defs>
                <linearGradient id="moonGradientEvening" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(251, 191, 36, 0.9)" />
                  <stop offset="50%" stopColor="rgba(167, 139, 250, 0.8)" />
                  <stop offset="100%" stopColor="rgba(79, 70, 229, 0.7)" />
                </linearGradient>
              </defs>
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="url(#moonGradientEvening)" />
            </svg>
            <FloatingStar delay={0} size="size-3" x={-20} y={-15} />
            <FloatingStar delay={0.5} size="size-2" x={20} y={-10} />
          </div>
        )
      };
    } else {
      return {
        greeting: "Good night, Ziv.",
        icon: (
          <div className="relative">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
              filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5)) drop-shadow(0 0 15px rgba(67, 56, 202, 0.3))'
            }}>
              <defs>
                <linearGradient id="moonGradientNight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(167, 139, 250, 0.9)" />
                  <stop offset="50%" stopColor="rgba(99, 102, 241, 0.8)" />
                  <stop offset="100%" stopColor="rgba(67, 56, 202, 0.7)" />
                </linearGradient>
              </defs>
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="url(#moonGradientNight)" />
            </svg>
            <FloatingZ delay={0} x="25px" y="-15px" size="0.8rem" />
            <FloatingZ delay={0.3} x="32px" y="-12px" size="1rem" />
            <FloatingZ delay={0.6} x="40px" y="-8px" size="1.2rem" />
          </div>
        )
      };
    }
  };

  const { greeting, icon } = getGreetingAndIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center text-white/90 text-2xl md:text-3xl lg:text-4xl font-medium mb-2 flex flex-col items-center gap-2"
    >
      <div className="text-white/90">
        {icon}
      </div>
      {greeting}
    </motion.div>
  );
};

export default TimeGreeting; 