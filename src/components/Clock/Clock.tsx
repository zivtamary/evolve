
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface ClockProps {
  className?: string;
}

const Clock: React.FC<ClockProps> = ({ className = '' }) => {
  const [time, setTime] = useState<Date>(new Date());
  const [format24h, setFormat24h] = useLocalStorage<boolean>('clock-24h-format', false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  const formatTime = (date: Date): string => {
    if (format24h) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const toggleTimeFormat = () => {
    setFormat24h(!format24h);
  };
  
  return (
    <div className={`text-center ${className}`}>
      <div className="group relative">
        <h1 
          className="text-shadow-lg cursor-pointer font-bold text-white text-7xl sm:text-8xl transition-all" 
          onClick={toggleTimeFormat}
        >
          {formatTime(time)}
        </h1>
        <div className="absolute -right-10 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={toggleTimeFormat}
            className="text-white/70 hover:text-white text-sm"
            title={format24h ? "Switch to 12h format" : "Switch to 24h format"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2" />
              <path d="M12 6v6l4 2" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-shadow mt-2 text-white text-xl">
        {formatDate(time)}
      </p>
    </div>
  );
};

export default Clock;
