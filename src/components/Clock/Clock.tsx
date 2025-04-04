import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { cn } from '@/lib/utils';

interface ClockProps {
  className?: string;
}

type ClockType = 'digital-12h' | 'digital-24h' | 'analog';

const Clock: React.FC<ClockProps> = ({ className = '' }) => {
  const [time, setTime] = useState<Date>(new Date());
  const [clockType, setClockType] = useLocalStorage<ClockType>('clock-type', 'digital-12h');
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  const formatTime = (date: Date): string => {
    if (clockType === 'digital-24h') {
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
  
  const toggleClockType = () => {
    if (clockType === 'digital-12h') {
      setClockType('digital-24h');
    } else if (clockType === 'digital-24h') {
      setClockType('analog');
    } else {
      setClockType('digital-12h');
    }
  };

  const getClockTypeTitle = (): string => {
    switch (clockType) {
      case 'digital-12h':
        return 'Switch to 24h format';
      case 'digital-24h':
        return 'Switch to analog clock';
      case 'analog':
        return 'Switch to 12h format';
      default:
        return '';
    }
  };

  const renderAnalogClock = () => {
    const hours = time.getHours() % 12;
    const minutes = time.getMinutes();
    
    const hourDegrees = (hours + minutes / 60) * 30; // 30 degrees per hour
    const minuteDegrees = minutes * 6; // 6 degrees per minute
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        {/* Clock face with subtle gradient */}
        <div className="absolute inset-0 rounded-full border-2 border-white/20 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm"></div>
        
        {/* Hour markers - positioned around the clock */}
        {[...Array(12)].map((_, i) => {
          const rotation = i * 30;
          const radian = (rotation - 90) * (Math.PI / 180);
          const x = 50 + 40 * Math.cos(radian);
          const y = 50 + 40 * Math.sin(radian);
          
          return (
            <div 
              key={i} 
              className={`absolute ${i % 3 === 0 ? 'w-1 h-3 bg-white/80' : 'w-0.5 h-2 bg-white/50'}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              }}
            ></div>
          );
        })}
        
        {/* Hour hand - thicker and more elegant */}
        <div 
          className="absolute w-1.5 h-12 bg-white rounded-full"
          style={{
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${hourDegrees}deg)`,
            transformOrigin: 'bottom center',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
          }}
        ></div>
        
        {/* Minute hand - thinner and more elegant */}
        <div 
          className="absolute w-1 h-16 bg-white/90 rounded-full"
          style={{
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${minuteDegrees}deg)`,
            transformOrigin: 'bottom center',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.2)'
          }}
        ></div>
        
        {/* Center dot with subtle glow */}
        <div 
          className="absolute w-2 h-2 bg-white rounded-full" 
          style={{ 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
          }}
        ></div>
      </div>
    );
  };
  
  return (
    <div className={cn("text-center", className)}>
      <div className="group relative">
        {clockType === 'analog' ? (
          <div 
            className="cursor-pointer transition-all hover:opacity-90"
            onClick={toggleClockType}
          >
            {renderAnalogClock()}
          </div>
        ) : (
          <h1 
            className="font-['Space_Grotesk'] font-light tracking-tight cursor-pointer text-white text-5xl sm:text-7xl lg:text-8xl transition-all hover:opacity-90"
            style={{
              textShadow: '2px 2px 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.2)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em'
            }}
            onClick={toggleClockType}
          >
            {formatTime(time)}
          </h1>
        )}
        <div className="absolute -right-8 sm:-right-10 top-2 sm:top-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={toggleClockType}
            className="text-white/70 hover:text-white text-sm p-1.5 sm:p-0"
            title={getClockTypeTitle()}
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
