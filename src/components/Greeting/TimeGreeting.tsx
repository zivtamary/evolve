import React, { useState } from 'react';
import { Sun, Moon, Coffee, Bed, MoonStarIcon, SunDim, Star, Cloud, Pencil, User } from 'lucide-react';
import type { Variants } from 'framer-motion';
import { motion, useAnimation } from 'framer-motion';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


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
    className="absolute text-white/70 font-bold pointer-events-none select-none"
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
  const [displayName, setDisplayName] = useLocalStorage('display_name', '');
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(displayName);
  const [nameError, setNameError] = useState('');
  
  const getGreetingAndIcon = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return {
        greeting: `Good morning${displayName ? ',' : '.'}`,
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
        greeting: `Good afternoon${displayName ? ',' : '.'}`,
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
        greeting: `Good evening${displayName ? ',' : '.'}`,
        icon: (
          <div className="relative">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 12px rgba(0, 0, 0, 0.5))'
            }}>
              <defs>
                <linearGradient id="moonGradientEvening" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                  <stop offset="50%" stopColor="rgba(200, 200, 200, 0.7)" />
                  <stop offset="100%" stopColor="rgba(17, 24, 39, 0.8)" />
                </linearGradient>
                <filter id="noise">
                  <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
                  <feColorMatrix type="saturate" values="0"/>
                </filter>
              </defs>
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="url(#moonGradientEvening)" />
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="url(#noise)" opacity="0.1" />
            </svg>
            <FloatingStar delay={0} size="size-3" x={-20} y={-15} />
            <FloatingStar delay={0.5} size="size-2" x={20} y={-10} />
          </div>
        )
      };
    } else {
      return {
        greeting: `Good night${displayName ? ',' : '.'}`,
        icon: (
          <div className="relative">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
              filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.2)) drop-shadow(0 0 10px rgba(0, 0, 0, 0.6))'
            }}>
              <defs>
                <linearGradient id="moonGradientNight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
                  <stop offset="50%" stopColor="rgba(180, 180, 180, 0.6)" />
                  <stop offset="100%" stopColor="rgba(17, 24, 39, 0.9)" />
                </linearGradient>
                <filter id="noiseNight">
                  <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
                  <feColorMatrix type="saturate" values="0"/>
                </filter>
              </defs>
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="url(#moonGradientNight)" />
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="url(#noiseNight)" opacity="0.15" />
            </svg>
            <FloatingZ delay={0} x="25px" y="-15px" size="0.8rem" />
            <FloatingZ delay={0.3} x="32px" y="-12px" size="1rem" />
            <FloatingZ delay={0.6} x="40px" y="-8px" size="1.2rem" />
          </div>
        )
      };
    }
  };

  const handleNameClick = () => {
    setNewName(displayName);
    setIsEditing(true);
  };

  const handleSaveName = () => {
    if (!newName || newName.trim() === '') {
      setNameError('Please enter your name');
      return;
    }
    setDisplayName(newName.trim());
    setIsEditing(false);
    setNameError('');
  };

  const { greeting, icon } = getGreetingAndIcon();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center text-white/90 text-2xl md:text-3xl lg:text-4xl font-medium mb-2 flex flex-col items-center gap-2"
      >
        <div className="text-white/90">
          {icon}
        </div>
        <div className="flex items-center whitespace-nowrap">
          <span>{greeting}</span>
          {displayName && (
            <>
              <span className="ml-2">{/* Add space after comma */}</span>
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNameClick}
                className="inline-flex items-center gap-1 cursor-pointer group"
              >
                <span className="text-white group-hover:text-white/90 transition-colors">
                  {displayName}
                </span>
              </motion.span>
              <span className="ml-0">.</span>
            </>
          )}
        </div>
      </motion.div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px] glass dark:glass-dark border-white/10">
          <DialogHeader className="border-b border-white/10 pb-3">
            <DialogTitle className="text-white text-xl font-semibold flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              <span>Edit Your Name</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSaveName();
          }} className="grid gap-5 mt-4">
            <div className="space-y-2">
              <label 
                htmlFor="name-input" 
                className="block text-sm mb-1.5 text-white/80 font-medium cursor-pointer hover:text-white transition-colors"
              >
                Name
              </label>
              <input
                id="name-input"
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNameError('');
                }}
                placeholder="Enter your name"
                className="w-full bg-black/10 dark:bg-black/20 px-4 py-2.5 rounded-lg outline-none border border-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all duration-200 text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
              {nameError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm"
                >
                  {nameError}
                </motion.p>
              )}
            </div>
            <div className="flex justify-end space-x-3 border-t border-white/10 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-sm bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimeGreeting; 