
import React, { useEffect, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface WeatherData {
  temperature: number;
  description: string;
  city: string;
  icon: string;
}

const Weather: React.FC = () => {
  const [weather, setWeather] = useLocalStorage<WeatherData | null>('weather-data', null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // For demo purposes, we'll use mock data
  useEffect(() => {
    const fetchWeather = async () => {
      // In a real application, you would fetch from a weather API
      // For now, we'll simulate with mock data
      try {
        setLoading(true);
        
        // Check if we need to refresh the cached weather (older than 30 minutes)
        const currentTime = new Date().getTime();
        const lastUpdate = localStorage.getItem('weather-last-update');
        
        if (!weather || !lastUpdate || currentTime - parseInt(lastUpdate) > 30 * 60 * 1000) {
          // Mock data for demonstration
          const mockWeather: WeatherData = {
            temperature: Math.floor(Math.random() * 15) + 15, // Random temperature between 15-30
            description: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'][Math.floor(Math.random() * 5)],
            city: 'San Francisco',
            icon: ['01d', '02d', '03d', '10d', '01n'][Math.floor(Math.random() * 5)]
          };
          
          setWeather(mockWeather);
          localStorage.setItem('weather-last-update', currentTime.toString());
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError('Failed to load weather data');
        setLoading(false);
      }
    };
    
    fetchWeather();
  }, [weather, setWeather]);
  
  const refreshWeather = () => {
    setWeather(null);
    localStorage.removeItem('weather-last-update');
  };
  
  if (loading) {
    return (
      <div className="glass dark:glass-dark animate-pulse rounded-xl p-4 text-white">
        <div className="h-10 w-24 bg-white/20 rounded"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="glass dark:glass-dark rounded-xl p-4 text-white">
        <p>{error}</p>
        <button 
          onClick={refreshWeather}
          className="mt-2 text-sm text-white/70 hover:text-white"
        >
          Try again
        </button>
      </div>
    );
  }
  
  if (!weather) {
    return null;
  }
  
  const getWeatherIcon = (iconCode: string) => {
    // Map icon codes to weather icons
    // In a real app, you would use proper weather icons
    const iconMap: Record<string, React.ReactNode> = {
      '01d': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2" />
          <path d="M12 21v2" />
          <path d="M4.2 4.2l1.4 1.4" />
          <path d="M18.4 18.4l1.4 1.4" />
          <path d="M1 12h2" />
          <path d="M21 12h2" />
          <path d="M4.2 19.8l1.4-1.4" />
          <path d="M18.4 5.6l1.4-1.4" />
        </svg>
      ),
      '02d': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
          <path d="M10 15H4a2 2 0 1 1 0-4h1a3 3 0 0 1 5 0" />
          <path d="M17 13h-3a2 2 0 1 0 0 4h2v.5" />
          <path d="M12 13V7" />
        </svg>
      ),
      '03d': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 22H5a3 3 0 1 1 .17-5.99A5.01 5.01 0 0 1 9 12.1c0-.17.02-.34.05-.5" />
          <path d="M17 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M18.21 9.5a5 5 0 1 0-3.72 8.5" />
        </svg>
      ),
      '10d': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9" />
          <path d="M16 14v6" />
          <path d="M8 14v6" />
          <path d="M12 16v6" />
        </svg>
      ),
      '01n': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      ),
    };
    
    return iconMap[iconCode] || iconMap['03d']; // Default to cloudy if icon not found
  };
  
  return (
    <div className="glass dark:glass-dark rounded-xl p-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{weather.temperature}°C</span>
            <div className="text-white/80">
              {getWeatherIcon(weather.icon)}
            </div>
          </div>
          <p className="text-sm text-white/80">{weather.description}</p>
          <p className="text-xs text-white/70">{weather.city}</p>
        </div>
        <button 
          onClick={refreshWeather}
          className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
          title="Refresh weather"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Weather;
