import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import BackgroundImage from '../components/Background/BackgroundImage';
import Clock from '../components/Clock/Clock';
import Weather from '../components/Weather/Weather';
import SearchBar from '../components/Search/SearchBar';
import Notes from '../components/ProductivityTools/Notes';
import TodoList from '../components/ProductivityTools/TodoList';
import Pomodoro from '../components/ProductivityTools/Pomodoro';
import Events from '../components/ProductivityTools/Events';
import SettingsSidebar from '../components/Settings/SettingsSidebar';
import WelcomeIntro from '../components/Welcome/WelcomeIntro';
import MotivationPhrase from '../components/Motivation/MotivationPhrase';
import TimeGreeting from '../components/Greeting/TimeGreeting';
import BackgroundPalette from '../components/Background/BackgroundPalette';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';

const Index = () => {
  const { theme } = useTheme();
  const { widgetVisibility, expandedWidget, widgetPositions } = useSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    const evolveData = JSON.parse(localStorage.getItem('evolve_data') || '{}');
    const lastSplashTime = evolveData.lastSplashScreenTime;
    if (!lastSplashTime) {
      return true;
    }
    const lastTime = new Date(lastSplashTime.value).getTime();
    const currentTime = new Date().getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return currentTime - lastTime > oneDayInMs;
  });
  const [showMainContent, setShowMainContent] = useState(!showWelcome);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [backgroundType, setBackgroundType] = useState<'image' | 'gradient' | 'solid'>('image');
  const [backgroundStyle, setBackgroundStyle] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const scrollToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // If Ctrl key is pressed, don't change slides (allows for zooming)
      if (e.ctrlKey) return;
      
      if (isScrolling) return;
      
      // If search bar is focused, don't change slides
      if (isSearchFocused) return;
      
      // Check if the scroll event originated from a widget
      const target = e.target as HTMLElement;
      const isWidgetScroll = target.closest('.widget') || 
                            target.closest('.overflow-y-auto') || 
                            target.closest('.overflow-auto');
      
      // If scrolling within a widget or if a widget is expanded, don't change slides
      if (isWidgetScroll || expandedWidget) return;
      
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
  }, [currentSlide, isScrolling, expandedWidget, isSearchFocused]);

  // Remove the scroll event listener since we're using transform now
  useEffect(() => {
    return () => {};
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    const evolveData = JSON.parse(localStorage.getItem('evolve_data') || '{}');
    evolveData.lastSplashScreenTime = { value: new Date().toISOString() };
    localStorage.setItem('evolve_data', JSON.stringify(evolveData));
  };

  const handleWelcomeStartFadeOut = () => {
    setShowMainContent(true);
  };

  // Get widgets in their correct positions
  const getOrderedWidgets = () => {
    const widgets = [
      { type: 'notes', position: widgetPositions.notes, component: Notes },
      { type: 'todoList', position: widgetPositions.todoList, component: TodoList },
      { type: 'pomodoro', position: widgetPositions.pomodoro, component: Pomodoro },
      { type: 'events', position: widgetPositions.events, component: Events }
    ];

    return widgets
      .sort((a, b) => a.position - b.position)
      .map(widget => ({
        type: widget.type,
        component: widget.component
      }));
  };
  
  const handleBackgroundTypeChange = (type: 'image' | 'gradient' | 'solid') => {
    if (type === 'image') {
      setBackgroundStyle('');
    }
    setBackgroundType(type);
  };
  
  const handleReturnToImage = () => {
    setBackgroundType('image');
    setBackgroundStyle('');
  };

  // Add effect to handle sequential loading
  useEffect(() => {
    if (showMainContent) {
      const backgroundTimer = setTimeout(() => {
        setBackgroundLoaded(true);
        
        const contentTimer = setTimeout(() => {
          setContentLoaded(true);
        }, 1500);
        
        return () => clearTimeout(contentTimer);
      }, 100);
      
      return () => clearTimeout(backgroundTimer);
    }
  }, [showMainContent]);

  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <WelcomeIntro 
            onComplete={handleWelcomeComplete} 
            onStartFadeOut={handleWelcomeStartFadeOut}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showMainContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          >
            <BackgroundImage>
              <motion.div 
                className={`min-h-screen relative overflow-hidden ${
                  backgroundType !== 'image' && backgroundStyle ? (
                    backgroundType === 'gradient' 
                      ? `bg-gradient-to-br ${backgroundStyle}` 
                      : backgroundStyle
                  ) : ''
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: backgroundLoaded ? 1 : 0 }}
                transition={{ duration: 1, ease: "easeInOut", delay: 1.5 }}
              >
                {/* Settings sidebar */}
                <SettingsSidebar />
                
                {/* Background palette */}
                <BackgroundPalette
                  currentType={backgroundType}
                  onTypeChange={handleBackgroundTypeChange}
                  onSelect={setBackgroundStyle}
                />
                
                {/* Slides container */}
                <motion.div 
                  className="fixed inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: contentLoaded ? 1 : 0 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <div 
                    className="h-full w-full flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {/* First slide - Clock, Weather, Search */}
                    <div className="h-full w-full flex flex-col items-center justify-center px-6 shrink-0">
                      <div className="absolute top-12 xs:top-16 sm:top-24 md:top-32 left-1/2 -translate-x-1/2 w-full">
                        <motion.div 
                          className="container mx-auto flex flex-col items-center px-4"
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 1.8 }}
                        >
                          <Clock />
                        </motion.div>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center flex-1">
                        <motion.div 
                          className="mb-12"
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ 
                            opacity: isSearchFocused ? 0.6 : 1,
                            y: isSearchFocused ? 40 : 0,
                            scale: isSearchFocused ? 0.9 : 1
                          }}
                          transition={{ 
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                          }}
                        >
                          <TimeGreeting />
                        </motion.div>
                        <motion.div 
                          className="w-full max-w-xs mb-8"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                            opacity: isSearchFocused ? 0.6 : 1,
                            y: isSearchFocused ? 60 : 0,
                            scale: isSearchFocused ? 0.95 : 1
                          }}
                          transition={{ 
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                          }}
                        >
                          <Weather />
                        </motion.div>
                          <SearchBar onFocusChange={setIsSearchFocused} />
                      </div>
                    </div>
                    
                    {/* Second slide - Productivity Tools */}
                    <div className="h-full w-full flex items-center justify-center px-6 shrink-0">
                      <section className="w-full">
                        <div className="container mx-auto max-w-4xl w-full">
                          {expandedWidget ? (
                            // When a widget is expanded, render it in a centered container
                            <div className="flex justify-center items-center w-full">
                              {getOrderedWidgets().map(({ type, component: Component }) => {
                                if (!widgetVisibility[type]) return null;
                                if (expandedWidget !== type) return null;
                                return <Component key={type} />;
                              })}
                            </div>
                          ) : (
                            // Normal grid layout when no widget is expanded
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [&>*:only-child]:md:col-span-2 [&>*:last-child:nth-child(2n-1)]:md:col-span-2 w-full">
                              {getOrderedWidgets().map(({ type, component: Component }) => {
                                if (!widgetVisibility[type]) return null;
                                return <Component key={type} />;
                              })}
                            </div>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
                </motion.div>
                
                {/* Motivation Phrase - Only visible on first slide */}
                {currentSlide === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: -20 }}
                    transition={{ duration: 0.8, delay: 2.6 }}
                    className="absolute bottom-8 left-0 right-0"
                  >
                    <MotivationPhrase />
                  </motion.div>
                )}
                
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
              </motion.div>
            </BackgroundImage>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Index;