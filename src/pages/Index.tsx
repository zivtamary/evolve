import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import BackgroundImage from '../components/Background/BackgroundImage';
import Clock from '../components/Clock/Clock';
import Weather from '../components/Weather/Weather';
import SearchBar from '../components/Search/SearchBar';
import Favorites from '../components/Favorites/Favorites';
import Notes from '../components/ProductivityTools/Notes';
import TodoList from '../components/ProductivityTools/TodoList';
import Pomodoro from '../components/ProductivityTools/Pomodoro';
import Events from '../components/ProductivityTools/Events';
import SettingsSidebar from '../components/Settings/SettingsSidebar';
import WelcomeIntro from '../components/Welcome/WelcomeIntro';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';

const Index = () => {
  const { theme, setTheme } = useTheme();
  const { widgetVisibility, temporaryHideWidgets } = useSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showMainContent, setShowMainContent] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };
  
  const getThemeIcon = () => {
    if (theme === 'dark') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      );
    } else if (theme === 'light') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 0v2M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 0h12" />
        </svg>
      );
    }
  };

  const scrollToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return;
      
      setIsScrolling(true);
      setTimeout(() => setIsScrolling(false), 1000); // Debounce scroll events
      
      // Use deltaX for horizontal scrolling, fallback to deltaY
      const delta = e.deltaX || e.deltaY;
      
      if (delta > 0 && currentSlide < 1) {
        setCurrentSlide(prev => prev + 1);
      } else if (delta < 0 && currentSlide > 0) {
        setCurrentSlide(prev => prev - 1);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSlide, isScrolling]);

  // Remove the scroll event listener since we're using transform now
  useEffect(() => {
    return () => {};
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };
  
  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <WelcomeIntro onComplete={handleWelcomeComplete} />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showMainContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <BackgroundImage>
              <div className="min-h-screen relative overflow-hidden">
                {/* Theme toggle button */}
                <button
                  onClick={toggleTheme}
                  className="absolute top-4 right-4 bg-black/20 dark:bg-transparent text-white p-2 rounded-full backdrop-blur-md hover:bg-black/30 transition-colors z-10"
                  title={`Current theme: ${theme}`}
                >
                  {getThemeIcon()}
                </button>
                
                {/* Settings sidebar */}
                <SettingsSidebar />
                
                {/* Slides container */}
                <div className="fixed inset-0">
                  <div 
                    className="h-full w-full flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {/* First slide - Clock, Weather, Search */}
                    <div className="h-full w-full flex flex-col items-center justify-center px-6 shrink-0">
                      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-full">
                        <div className="container mx-auto flex flex-col items-center">
                          <Clock className="animate-fade-in" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center flex-1">
                        <div className="w-full max-w-xs mb-8 animate-slide-up opacity-0 animate-delay-200" style={{ animationFillMode: 'forwards' }}>
                          <Weather />
                        </div>
                        <div className="animate-slide-up opacity-0 animate-delay-300" style={{ animationFillMode: 'forwards' }}>
                          <SearchBar />
                        </div>
                      </div>
                    </div>
                    
                    {/* Second slide - Productivity Tools */}
                    <div className="h-full w-full flex items-center justify-center px-6 shrink-0">
                      <section>
                        <div className="container mx-auto max-w-4xl">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [&>*:only-child]:md:col-span-2 [&>*:last-child:nth-child(2n-1)]:md:col-span-2">
                            {widgetVisibility.notes && <Notes />}
                            {!temporaryHideWidgets && (
                              <>
                                {widgetVisibility.todoList && <TodoList />}
                                {widgetVisibility.pomodoro && <Pomodoro />}
                                {widgetVisibility.events && <Events />}
                              </>
                            )}
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
                
                {/* Navigation dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  <button
                    onClick={() => {
                      setCurrentSlide(0);
                      scrollToSlide(0);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentSlide === 0 ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'
                    }`}
                    title="Home"
                  />
                  <button
                    onClick={() => {
                      setCurrentSlide(1);
                      scrollToSlide(1);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentSlide === 1 ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'
                    }`}
                    title="Productivity Tools"
                  />
                </div>
              </div>
            </BackgroundImage>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Index;
