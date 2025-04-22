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
      case 'chatgpt':
        searchUrl = `https://chat.openai.com/?q=${encodeURIComponent(query)}`;
        break;
      default:
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    
    window.location.href = searchUrl;
  };
  
  const changeSearchEngine = () => {
    const engines = ['google', 'bing', 'duckduckgo', 'chatgpt'];
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
      case 'chatgpt':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className='dark:fill-white' preserveAspectRatio="xMidYMid" viewBox="0 0 256 260"><path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"/></svg>
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
                placeholder={searchEngine === 'chatgpt' ? 'Ask ChatGPT...' : `Search with ${searchEngine.charAt(0).toUpperCase() + searchEngine.slice(1)}`}
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
