import React, { useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { supabase } from '../../integrations/supabase/client';
import { 
  Sun, 
  CloudSun, 
  Cloud, 
  Cloudy, 
  CloudRain, 
  CloudSunRain, 
  CloudLightning, 
  CloudSnow, 
  CloudFog,
  Moon,
  MoonStar,
  RefreshCw
} from 'lucide-react';

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
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('weather', {
        body: { lat, lon }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No weather data received');
      }

      setWeather(data);
      localStorage.setItem('weather-last-update', new Date().getTime().toString());
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  }, [setWeather]);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            setError('Location access denied. Please enable location services.');
          }
        );
      } else {
        setError('Geolocation is not supported by your browser.');
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (!location) return;

    const currentTime = new Date().getTime();
    const lastUpdate = localStorage.getItem('weather-last-update');
    const lastUpdateTime = lastUpdate ? parseInt(lastUpdate) : 0;
    const timeSinceLastUpdate = currentTime - lastUpdateTime;
    const thirtyMinutes = 30 * 60 * 1000;

    // Only fetch if we don't have weather data or it's older than 30 minutes
    if (!weather || timeSinceLastUpdate > thirtyMinutes) {
      fetchWeather(location.lat, location.lon);
    }
  }, [location, weather, fetchWeather]);
  
  const refreshWeather = useCallback(() => {
    if (location) {
      fetchWeather(location.lat, location.lon);
    }
  }, [location, fetchWeather]);
  
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
    // Map icon codes to Lucide icons
    const iconMap: Record<string, React.ReactNode> = {
      '01d': <Sun size={24} />,
      '02d': <CloudSun size={24} />,
      '03d': <Cloud size={24} />,
      '04d': <Cloudy size={24} />,
      '09d': <CloudRain size={24} />,
      '10d': <CloudSunRain size={24} />,
      '11d': <CloudLightning size={24} />,
      '13d': <CloudSnow size={24} />,
      '50d': <CloudFog size={24} />,
      '01n': <Moon size={24} />,
      '02n': <MoonStar size={24} />,
      '03n': <Cloud size={24} />,
      '04n': <Cloudy size={24} />,
      '09n': <CloudRain size={24} />,
      '10n': <CloudRain size={24} />,
      '11n': <CloudLightning size={24} />,
      '13n': <CloudSnow size={24} />,
      '50n': <CloudFog size={24} />
    };
    
    return iconMap[iconCode] || <Cloud size={24} />; // Default to cloudy if icon not found
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
          <p className="text-sm text-white/80 capitalize">{weather.description}</p>
          <p className="text-xs text-white/70">{weather.city}</p>
        </div>
        <button 
          onClick={refreshWeather}
          className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
          title="Refresh weather"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
};

export default Weather;
