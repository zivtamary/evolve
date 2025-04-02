
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import BackgroundImage from '../components/Background/BackgroundImage';
import Clock from '../components/Clock/Clock';
import Weather from '../components/Weather/Weather';
import SearchBar from '../components/Search/SearchBar';
import Favorites from '../components/Favorites/Favorites';
import Notes from '../components/ProductivityTools/Notes';
import TodoList from '../components/ProductivityTools/TodoList';
import Pomodoro from '../components/ProductivityTools/Pomodoro';
import Events from '../components/ProductivityTools/Events';

const Index = () => {
  const { theme, setTheme } = useTheme();
  
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
  
  return (
    <BackgroundImage>
      <div className="min-h-screen px-6 py-10">
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/30 transition-colors z-10"
          title={`Current theme: ${theme}`}
        >
          {getThemeIcon()}
        </button>
        
        {/* Header section with time and weather */}
        <header className="mb-8">
          <div className="container mx-auto flex flex-col items-center">
            <Clock className="mb-8 animate-fade-in" />
            <div className="w-full max-w-xs mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Weather />
            </div>
          </div>
        </header>
        
        {/* Search section */}
        <section className="mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <SearchBar />
        </section>
        
        {/* Favorites section */}
        <section className="mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="container mx-auto max-w-4xl">
            <Favorites />
          </div>
        </section>
        
        {/* Productivity tools section */}
        <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Notes />
                <Pomodoro />
              </div>
              <div className="space-y-6">
                <TodoList />
                <Events />
              </div>
            </div>
          </div>
        </section>
      </div>
    </BackgroundImage>
  );
};

export default Index;
