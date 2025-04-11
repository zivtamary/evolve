import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SplashScreenProps {
  onComplete: () => void;
  onStartFadeOut?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, onStartFadeOut }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [displayName] = useLocalStorage('display_name', '');

  useEffect(() => {
    // Total animation duration is about 3 seconds
    const timer = setTimeout(() => {
      setIsExiting(true);
      // Call onStartFadeOut when the welcome message starts fading out
      if (onStartFadeOut) {
        onStartFadeOut();
      }
      // Delay the actual completion to allow exit animation to play
      setTimeout(() => {
        onComplete();
      }, 1000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete, onStartFadeOut]);

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.2,
            filter: "blur(20px)",
            transition: { duration: 1, ease: "easeInOut" }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Darker background */}
            <motion.div
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ 
                scale: 1.5, 
                opacity: 0,
                transition: { duration: 1, ease: "easeInOut" }
              }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"
            />
            
            {/* Subtle animated circles */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  opacity: [0, 0.2, 0.1],
                  x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
                  y: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
                }}
                exit={{ 
                  scale: 0, 
                  opacity: 0,
                  transition: { duration: 1, ease: "easeInOut" }
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
                className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-indigo-900/30 to-purple-900/30 blur-3xl"
              />
            ))}

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Simple icon with fade-in */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ 
                  opacity: 0,
                  y: -20,
                  transition: { duration: 0.5, ease: "easeInOut" }
                }}
                transition={{ duration: 1, delay: 0.5 }}
                className="mb-8"
              >
                <SparklesIcon className="w-16 h-16 text-white" />
              </motion.div>

              {/* App name */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ 
                  opacity: 0,
                  y: 20,
                  transition: { duration: 0.5, ease: "easeInOut" }
                }}
                transition={{ duration: 0.5, delay: 1 }}
                className="text-center"
              >
                <motion.h1
                  className="text-4xl font-bold text-white mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  {displayName ? `Welcome back, ${displayName}.` : 'Welcome to Evolve'}
                </motion.h1>
                <motion.p
                  className="text-white/60 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                >
                  Your personal productivity hub
                </motion.p>
              </motion.div>
            </div>

            {/* Enhanced sparkles */}
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  scale: 0,
                  opacity: 0,
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0],
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight
                }}
                exit={{ 
                  opacity: 0,
                  transition: { duration: 0.5, ease: "easeInOut" }
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: i * 0.05,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 1
                }}
                className={`absolute rounded-full ${
                  i % 3 === 0 
                    ? "w-2 h-2 bg-white" 
                    : i % 3 === 1 
                      ? "w-1.5 h-1.5 bg-white/80" 
                      : "w-1 h-1 bg-white/60"
                }`}
              />
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen; 