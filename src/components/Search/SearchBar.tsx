import React, { useRef, useEffect, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { TooltipContent, TooltipProvider } from '../ui/tooltip';
import { Tooltip } from '../ui/tooltip';
import { TooltipTrigger } from '../ui/tooltip';

// Add a custom hook to detect if we're on mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is a common breakpoint for mobile
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

interface SearchBarProps {
  className?: string;
  onFocusChange?: (focused: boolean) => void;
}

const SUGGESTIONS = [
  'Weather forecast',
  'Latest news',
  'Popular movies',
  'Top restaurants',
  'Travel destinations',
  'Tech reviews',
  'Fitness tips',
  'Recipe ideas',
  'Shopping deals',
  'Local events'
];

const SearchBar: React.FC<SearchBarProps> = ({ className = '', onFocusChange }) => {
  const [searchEngine, setSearchEngine] = useLocalStorage<string>('search-engine', 'google');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [googleSuggestions, setGoogleSuggestions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const searchTimeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    onFocusChange?.(isFocused);
  }, [isFocused, onFocusChange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const query = inputRef.current?.value.trim();
    if (!query) return;
    
    let searchUrl = '';
    
    switch (searchEngine) {
      case 'google':
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'bing':
        searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'duckduckgo':
        searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
        break;
      default:
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    
    window.location.href = searchUrl;
  };
  
  const changeSearchEngine = () => {
    const engines = ['google', 'bing', 'duckduckgo'];
    const currentIndex = engines.indexOf(searchEngine);
    const nextIndex = (currentIndex + 1) % engines.length;
    setSearchEngine(engines[nextIndex]);
  };
  
  const getSearchEngineLogo = () => {
    switch (searchEngine) {
      case 'google':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.5 12c0-.82-.07-1.61-.19-2.38H12v4.51h5.95a5.07 5.07 0 0 1-2.2 3.31v2.77h3.56c2.08-1.92 3.29-4.74 3.29-8.21Z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.55 4.2 1.63l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
          </svg>
        );
      case 'bing':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3v16.5l4.72 1.55L19 17.69V3H5zm12.25 12.38L14 17l-4-2.13v-7l1.5-.5 2.5 1v5.5l3.25 1.5zm0-6.38L14 10.5 9 8.5l-1.25 3L9 13l2.75-1V8.5L17.25 9z" fill="#0078D4" />
          </svg>
        );
      case 'duckduckgo':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#DE5833" />
            <path d="M15.5 11.5c0 1.93-1.57 3.5-3.5 3.5S8.5 13.43 8.5 11.5 10.07 8 12 8s3.5 1.57 3.5 3.5z" fill="#FFF" />
          </svg>
        );
      default:
        return null;
    }
  };

  const fetchGoogleSuggestions = async (query: string) => {
    if (!query.trim()) {
      setGoogleSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`https://www.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      // Google's API returns an array where the first element is the query and the second is an array of suggestions
      if (data && Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
        setGoogleSuggestions(data[1]);
      } else {
        setGoogleSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching Google suggestions:', error);
      setGoogleSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.trim()) {
      // Filter local suggestions
      const filtered = SUGGESTIONS.filter(suggestion => 
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      
      // Only fetch Google suggestions if Google is the selected search engine
      if (searchEngine === 'google') {
        searchTimeoutRef.current = window.setTimeout(() => {
          fetchGoogleSuggestions(value);
        }, 300);
      } else {
        setGoogleSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setGoogleSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    if (inputRef.current) {
      inputRef.current.value = suggestion;
    }
    setSuggestions([]);
    setGoogleSuggestions([]);
  };
  
  return (
    <>
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsFocused(false)}
          />
        )}
      </AnimatePresence>
      
      <div className="relative w-[90vw] sm:w-[400px] mx-auto">
        <motion.div 
          className={className}
          initial={false}
          animate={{ 
            position: 'fixed',
            top: isFocused ? '20vh' : (isMobile ? '' : ''),
            left: '50%',
            x: '-50%',
            y: '-50%',
            width: isFocused ? '95vw' : '90vw',
            maxWidth: isFocused ? '800px' : '300px',
            zIndex: isFocused ? 50 : 1
          }}
          transition={{ 
            type: "spring",
            stiffness: 180,
            damping: 28,
            mass: 1.1,
            restDelta: 0.001
          }}
        >
          <form onSubmit={handleSearch} className="relative">
            <motion.div 
              className="glass dark:glass-dark flex items-center rounded-full px-3 sm:px-5 py-2 text-white"
              animate={{
                scale: isFocused ? 1.02 : 1,
                boxShadow: isFocused ? '0 0 20px rgba(255,255,255,0.2)' : ''
              }}
              transition={{ 
                duration: 0.3,
                ease: "easeInOut"
              }}
            >
              <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                <button
                  type="button"
                className="relative mr-2 sm:mr-3 shrink-0 transition-opacity duration-300"
                onClick={changeSearchEngine}
              >
                <div className="absolute -top-0.5 right-0 w-1 h-1 bg-white/60 rounded-full animate-pulse" />
                {getSearchEngineLogo()}
              </button>
              </TooltipTrigger>
              <TooltipContent children={`Search with ${searchEngine.charAt(0).toUpperCase() + searchEngine.slice(1)}`} />
              </Tooltip>
              </TooltipProvider>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                placeholder="Search the web..."
                className="w-full bg-transparent py-2 outline-none placeholder:text-white/70 text-base"
              />
              <button 
                type="submit"
                className="ml-2 sm:ml-3 shrink-0 text-white/70 hover:text-white transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </motion.div>
            
            <AnimatePresence>
              {isFocused && (suggestions.length > 0 || googleSuggestions.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 glass dark:glass-dark rounded-xl overflow-hidden"
                >
                  {suggestions.length > 0 && (
                    <div className="px-3 py-2 text-xs font-medium text-white/60 uppercase tracking-wider">
                      Suggestions
                    </div>
                  )}
                  
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={`suggestion-${suggestion}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left text-white/90 hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                      {suggestion}
                    </motion.button>
                  ))}
                  
                  {googleSuggestions.length > 0 && (
                    <div className="px-3 py-2 text-xs font-medium text-white/60 uppercase tracking-wider border-t border-white/10">
                      By Google
                    </div>
                  )}
                  
                  {googleSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={`google-${suggestion}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (suggestions.length + index) * 0.05 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left text-white/90 hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                      {suggestion}
                    </motion.button>
                  ))}
                  
                  {isLoading && (
                    <div className="px-4 py-3 text-white/60 text-sm flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading suggestions...
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default SearchBar;
