import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { cn } from '@/lib/utils';

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
    const time = date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
    return time.replace(/am|pm/i, (match) => match.toUpperCase());
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
    <div className={cn("text-center", className)}>
      <div className="group relative">
        <h1 
          className="font-['Space_Grotesk'] font-light tracking-tight cursor-pointer text-white text-6xl sm:text-8xl lg:text-9xl transition-all hover:opacity-90"
          style={{
            textShadow: '2px 2px 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.2)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em'
          }}
          onClick={toggleTimeFormat}
        >
          {formatTime(time)}
        </h1>
        <div className="absolute -right-8 sm:-right-10 top-2 sm:top-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={toggleTimeFormat}
            className="text-white/70 hover:text-white text-sm p-1.5 sm:p-0"
            title={format24h ? "Switch to 12h format" : "Switch to 24h format"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2" />
              <path d="M12 6v6l4 2" />
            </svg>
          </button>
        </div>
      </div>
      <p 
        className="mt-3 sm:mt-4 text-white/70 text-lg sm:text-2xl font-['Inter'] font-light tracking-wide"
        style={{ 
          textShadow: '1px 1px 10px rgba(255, 255, 255, 0.2), 0 0 20px rgba(255, 255, 255, 0.1)',
          letterSpacing: '0.02em'
        }}
      >
        {formatDate(time)}
      </p>
    </div>
  );
};

export default Clock;
