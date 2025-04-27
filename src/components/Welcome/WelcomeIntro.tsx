import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from './SplashScreen';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useLanguage } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Language } from '@/translations';

interface WelcomeIntroProps {
  onComplete: () => void;
  onStartFadeOut?: () => void;
}

const WelcomeIntro: React.FC<WelcomeIntroProps> = ({ onComplete, onStartFadeOut }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useLocalStorage('display_name', '');
  const [nameError, setNameError] = useState('');
  const { language, setLanguage, t } = useLanguage();
  const [currentLanguageText, setCurrentLanguageText] = useState('Choose your language');
  const [languageIndex, setLanguageIndex] = useState(0);

  const languageTexts = [
    'Choose your language',
    'Wähle deine Sprache',
    'Elige tu idioma',
    'Choisissez votre langue',
    'Scegli la tua lingua',
    '言語を選択してください',
    'Выберите язык'
  ];

  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setLanguageIndex((prev) => (prev + 1) % languageTexts.length);
        setCurrentLanguageText(languageTexts[languageIndex]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [step, languageIndex]);

  // Add class to body when component mounts and remove when it unmounts
  useEffect(() => {
    document.body.classList.add('splash-screen-active');
    return () => {
      document.body.classList.remove('splash-screen-active');
    };
  }, []);

  const handleNext = () => {
    if (step < 4) {
      if (step === 3 && (!name || name.trim() === '')) {
        setNameError('Please enter your name');
        return;
      }
      
      if (step === 3) {
        setDisplayName(name.trim());
      }

      if (step === 0) {
        // Set splash screen to seen if user has name in local storage
        if (displayName) {
            onComplete();
            return;
        }
      }
      
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <SplashScreen onComplete={handleNext} onStartFadeOut={onStartFadeOut} />;
      case 1:
        return (
          <div className='flex flex-col items-center justify-center'>
            <motion.div
              key={currentLanguageText}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="h-20 flex items-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {currentLanguageText}
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-8"
            >
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as Language)}
              >
                <SelectTrigger className="w-[200px] bg-white/10 text-white border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English 🇬🇧</SelectItem>
                  <SelectItem value="de">Deutsch 🇩🇪</SelectItem>
                  <SelectItem value="es">Español 🇪🇸</SelectItem>
                  <SelectItem value="fr">Français 🇫🇷</SelectItem>
                  <SelectItem value="it">Italiano 🇮🇹</SelectItem>
                  <SelectItem value="ja">日本語 🇯🇵</SelectItem>
                  <SelectItem value="ru">Русский 🇷🇺</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>
        );
      case 2:
        return (
          <div className='flex flex-col items-center justify-center'>
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="select-none text-4xl md:text-6xl font-bold text-white mb-4"
            >
              Welcome to Evolve! 👋
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-xl text-white/80 mb-8"
            >
              Your personal productivity dashboard awaits!
            </motion.p>
          </div>
        );
      case 3:
        return (
          <>
            <motion.h2
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4"
            >
              What's your name?
            </motion.h2>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-8"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) {
                    handleNext();
                  }
                }}
                placeholder="Enter your name"
                className={`px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/50 border ${nameError ? 'border-red-500' : 'border-white/20'} focus:outline-none focus:border-white/50 w-64 text-center text-xl`}
              />
              {nameError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 mt-2 text-sm"
                >
                  {nameError}
                </motion.p>
              )}
            </motion.div>
          </>
        );
      case 4:
        return (
          <>
            <motion.h2
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4"
            >
              Welcome, {displayName}!
            </motion.h2>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="max-w-2xl mx-auto space-y-4 text-white/80 my-4"
            >
              <p className="text-xl">
                This is your personal productivity dashboard. Here's what you can do:
              </p>
              <ul className="text-lg space-y-2">
                <motion.li
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-white">•</span> Check the time and weather
                </motion.li>
                <motion.li
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-white">•</span> Use the search bar to quickly find anything
                </motion.li>
                <motion.li
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-white">•</span> Manage your tasks and notes
                </motion.li>
                <motion.li
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-white">•</span> Track your events and schedule
                </motion.li>
              </ul>
            </motion.div>
          </>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="text-center">
        {renderStep()}

        {step > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              {step === 4 ? 'Get Started' : 'Next'}
            </motion.button>
          </motion.div>
        )}

        {step > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center gap-2 mt-8"
          >
            {[1, 2, 3, 4].map((dot) => (
              <div
                key={dot}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  dot === step ? 'bg-white scale-125' : 'bg-white/50'
                }`}
              />
            ))}
          </motion.div>
        )}

        {/* Sparkles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              scale: 0,
              opacity: 0,
              x: Math.random() * 400 - 200,
              y: Math.random() * 400 - 200
            }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: Math.random() * 400 - 200,
              y: Math.random() * 400 - 200
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              repeatDelay: Math.random() * 2
            }}
            className="absolute w-2 h-2 bg-white rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
};

export default WelcomeIntro; 