import React, { useRef, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className = '' }) => {
  const [searchEngine, setSearchEngine] = useLocalStorage<string>('search-engine', 'google');
  const inputRef = useRef<HTMLInputElement>(null);
  
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
  
  return (
    <div className={`w-[90vw] sm:w-[400px] mx-auto transition-all duration-500 ease-in-out focus-within:w-[95vw] sm:focus-within:w-[600px] ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="glass dark:glass-dark flex items-center rounded-full px-3 sm:px-5 py-2 text-white transition-all duration-500 ease-in-out focus-within:ring focus-within:ring-white/30">
          <button
            type="button"
            className="relative mr-2 sm:mr-3 shrink-0 transition-opacity duration-300"
            onClick={changeSearchEngine}
            title={`Search with ${searchEngine.charAt(0).toUpperCase() + searchEngine.slice(1)}`}
          >
            <div className="absolute -top-0.5 right-0 w-1 h-1 bg-white/60 rounded-full animate-pulse" />
            {getSearchEngineLogo()}
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search the web..."
            className="w-full bg-transparent py-2 outline-none placeholder:text-white/70 transition-all duration-500 ease-in-out text-sm sm:text-base"
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
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
