import React, { useState, useEffect } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Baseline, Edit, Pen, Settings2 } from "lucide-react";
import { TooltipProvider } from "../ui/tooltip";
import { Tooltip } from "../ui/tooltip";
import { TooltipContent } from "../ui/tooltip";
import { TooltipTrigger } from "../ui/tooltip";
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
} from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";

interface ClockProps {
  className?: string;
}

type ClockType = "digital-12h" | "digital-24h" | "analog";
type DateFormat = "default" | "long" | "short" | "numeric" | "compact";

interface ClockStyle {
  font: string;
  color: string;
}

interface WeatherData {
  temperature: number;
  description: string;
  city: string;
  icon: string;
}

const FONT_OPTIONS = [
  { name: "SF Pro", value: 'font-["SF_Pro_Display"]', preview: "12" },
  { name: "Space Grotesk", value: 'font-["Space_Grotesk"]', preview: "12" },
  { name: "Inter", value: 'font-["Inter"]', preview: "12" },
  { name: "Roboto", value: 'font-["Roboto"]', preview: "12" },
  { name: "System", value: "font-sans", preview: "12" },
];

const COLOR_OPTIONS = [
  { name: "Black", value: "text-black", bg: "bg-black" },
  { name: "White", value: "text-white", bg: "bg-white" },
  { name: "Yellow", value: "text-yellow-400", bg: "bg-yellow-400" },
  { name: "Green", value: "text-green-400", bg: "bg-green-400" },
  { name: "Blue", value: "text-blue-400", bg: "bg-blue-400" },
  { name: "Purple", value: "text-purple-400", bg: "bg-purple-400" },
  { name: "Pink", value: "text-pink-400", bg: "bg-pink-400" },
  { name: "Red", value: "text-red-400", bg: "bg-red-400" },
  { name: "Orange", value: "text-orange-400", bg: "bg-orange-400" },
];

const Clock: React.FC<ClockProps> = ({ className = "" }) => {
  const [time, setTime] = useState<Date>(new Date());
  const [clockType, setClockType] = useLocalStorage<ClockType>(
    "clock-type",
    "digital-24h"
  );
  const [dateFormat, setDateFormat] = useLocalStorage<DateFormat>(
    "date-format",
    "default"
  );
  const [clockStyle, setClockStyle] = useLocalStorage<ClockStyle>(
    "clock-style",
    {
      font: FONT_OPTIONS[1].value,
      color: COLOR_OPTIONS[1].value,
    }
  );
  const [weather] = useLocalStorage<WeatherData | null>('weather-data', null);
  const [tempUnit] = useLocalStorage<'C' | 'F'>('temp-unit', 'C');

  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (date: Date): string => {
    if (clockType === "digital-24h") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return time.replace(/am|pm/i, (match) => match.toUpperCase());
  };

  const formatDate = (date: Date): string => {
    switch (dateFormat) {
      case "default":
        return date.toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
        });
      case "long":
        return date.toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      case "short":
        return date.toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      case "numeric":
        return date.toLocaleDateString([], {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        });
      case "compact":
        return date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        });
      default:
        return date.toLocaleDateString();
    }
  };

  const toggleDateFormat = () => {
    const formats: DateFormat[] = ["default", "long", "short", "numeric", "compact"];
    const currentIndex = formats.indexOf(dateFormat);
    const nextIndex = (currentIndex + 1) % formats.length;
    setDateFormat(formats[nextIndex]);
  };

  const getDateFormatTitle = (): string => {
    switch (dateFormat) {
      case "default":
        return "Switch to full format";
      case "long":
        return "Switch to short format";
      case "short":
        return "Switch to numeric format";
      case "numeric":
        return "Switch to compact format";
      case "compact":
        return "Switch to default format";
      default:
        return "";
    }
  };

  const toggleClockType = () => {
    if (clockType === "digital-12h") {
      setClockType("digital-24h");
    } else if (clockType === "digital-24h") {
      setClockType("analog");
    } else {
      setClockType("digital-12h");
    }
  };

  const getClockTypeTitle = (): string => {
    switch (clockType) {
      case "digital-12h":
        return t('switchTo24hClock');
      case "digital-24h":
        return t('switchToAnalogClock');
      case "analog":
        return t('switchTo12hClock');
      default:
        return "";
    }
  };

  const renderAnalogClock = () => {
    const hours = time.getHours() % 12;
    const minutes = time.getMinutes();

    const hourDegrees = (hours + minutes / 60) * 30; // 30 degrees per hour
    const minuteDegrees = minutes * 6; // 6 degrees per minute

    return (
      <div className="relative size-32 sm:size-40 lg:size-40 mx-auto">
        {/* Clock face with subtle gradient */}
        <div className="absolute inset-0 rounded-full border-2 border-white/50 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm dark:from-black/10 dark:to-black/10"></div>

        {/* Hour markers - positioned around the clock */}
        {[...Array(12)].map((_, i) => {
          const rotation = i * 30;
          const radian = (rotation - 90) * (Math.PI / 180);
          const x = 50 + 40 * Math.cos(radian);
          const y = 50 + 40 * Math.sin(radian);

          return (
            <div
              key={i}
              className={`absolute ${
                i % 3 === 0 ? "w-1 h-3 bg-white/80" : "w-0.5 h-2 bg-white/50"
              }`}
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
          className="absolute w-1 h-10 lg:h-11 bg-white rounded-full"
          style={{
            left: "50%",
            bottom: "50%",
            transform: `translateX(-50%) rotate(${hourDegrees}deg)`,
            transformOrigin: "bottom center",
            boxShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
          }}
        ></div>

        {/* Minute hand - thinner and more elegant */}
        <div
          className="absolute w-1 h-12 sm:h-12 lg:h-16 bg-white/90 rounded-full"
          style={{
            left: "50%",
            bottom: "50%",
            transform: `translateX(-50%) rotate(${minuteDegrees}deg)`,
            transformOrigin: "bottom center",
            boxShadow: "0 0 8px rgba(255, 255, 255, 0.2)",
          }}
        ></div>

        {/* Center dot with subtle glow */}
        <div
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
          }}
        ></div>
      </div>
    );
  };

  const renderStyleOptions = () => (
    <DrawerContent className="bg-transparent backdrop-blur-xl border-t border-white/5">
      <div className="max-w-md mx-auto px-6 py-4">
        <h3 className="text-base font-medium text-white text-center mb-8">
          {t('fontAndColor')}
        </h3>
        <div className="space-y-4">
          <div>
            <div className="overflow-x-auto -mx-6 px-6">
              <div className="flex gap-3 min-w-max">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.value}
                    onClick={() =>
                      setClockStyle({ ...clockStyle, font: font.value })
                    }
                    className={cn(
                      "relative w-16 h-16 rounded-2xl text-center transition-all",
                      font.value,
                      clockStyle.font === font.value
                        ? "bg-zinc-700 text-white"
                        : "bg-zinc-800/50 text-white/70 hover:bg-zinc-700/50"
                    )}
                  >
                    <span className="block text-3xl">{font.preview}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="h-px w-full bg-white/10" />
          <div>
            <div className="overflow-x-auto -mx-6 px-6 pt-2">
              <div className="flex gap-3 min-w-max pb-4">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() =>
                      setClockStyle({ ...clockStyle, color: color.value })
                    }
                    className={cn(
                      "group relative w-10 h-10 rounded-full transition-all flex-shrink-0",
                      color.bg,
                      clockStyle.color === color.value
                        ? "ring-2 ring-white"
                        : "ring-1 ring-white/20 hover:ring-white/40"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                        "bg-gradient-to-b from-white/10 to-transparent"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DrawerContent>
  );

  const getWeatherIcon = (iconCode: string) => {
    // Map icon codes to Lucide icons
    const iconMap: Record<string, React.ReactNode> = {
      '01d': <Sun size={20} />,
      '02d': <CloudSun size={20} />,
      '03d': <Cloud size={20} />,
      '04d': <Cloudy size={20} />,
      '09d': <CloudRain size={20} />,
      '10d': <CloudSunRain size={20} />,
      '11d': <CloudLightning size={20} />,
      '13d': <CloudSnow size={20} />,
      '50d': <CloudFog size={20} />,
      '01n': <Moon size={20} />,
      '02n': <MoonStar size={20} />,
      '03n': <Cloud size={20} />,
      '04n': <Cloudy size={20} />,
      '09n': <CloudRain size={20} />,
      '10n': <CloudRain size={20} />,
      '11n': <CloudLightning size={20} />,
      '13n': <CloudSnow size={20} />,
      '50n': <CloudFog size={20} />
    };
    
    return iconMap[iconCode] || <Cloud size={20} />; // Default to cloudy if icon not found
  };

  return (
    <div className={cn("text-center", className)}>
      <div className="group relative">
        {clockType === "analog" ? (
          <div
            className="cursor-pointer transition-all hover:opacity-90"
            onClick={toggleClockType}
          >
            {renderAnalogClock()}
          </div>
        ) : (
          <div className="relative">
            <h1
              className={cn(
                clockStyle.font,
                clockStyle.color,
                "font-light tracking-tight cursor-pointer text-5xl sm:text-7xl lg:text-8xl transition-all hover:opacity-90 select-none"
              )}
              style={{
                textShadow:
                  "2px 2px 20px rgba(0,0,0, 0.1), 0 0 40px rgba(0,0,0, 0.1)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.02em",
              }}
              onClick={toggleClockType}
            >
              {formatTime(time)}
            </h1>
            <div className="absolute -right-8 sm:-right-10 top-2 sm:top-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleClockType}
                      className="text-white/70 hover:text-white text-sm p-1.5 sm:p-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent children={getClockTypeTitle()} />
                </Tooltip>
              </TooltipProvider>
            </div>
            <Drawer>
              <DrawerTrigger asChild>
                <div className="absolute -right-8 sm:-right-10 top-9 sm:top-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-white/70 hover:text-white text-sm p-1.5 sm:p-0">
                          <Settings2 className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent children={t('fontAndColorSettings')} />
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </DrawerTrigger>
              {renderStyleOptions()}
            </Drawer>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 items-center">
        <p
          className={cn(
            clockStyle.font,
            clockStyle.color,
            "mt-3 sm:mt-4 text-lg sm:text-2xl font-light tracking-wide opacity-70 select-none cursor-pointer hover:opacity-100 transition-opacity"
          )}
          style={{
            textShadow:
              "1px 1px 10px rgba(0,0,0, 0.1), 0 0 10px rgba(0,0,0, 0.1)",
            letterSpacing: "0.02em",
          }}
          onClick={toggleDateFormat}
        >
          {formatDate(time)}
          <div className="absolute -right-8 sm:-right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleDateFormat}
                    className="text-white/70 hover:text-white text-sm p-1.5 sm:p-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent children={getDateFormatTitle()} />
              </Tooltip>
            </TooltipProvider>
          </div>
        </p>
        {weather && (
          <div
            className={cn(
              clockStyle.font,
              clockStyle.color,
              "text-base sm:text-xl font-light tracking-wide opacity-60 select-none"
            )}
            style={{
              textShadow:
                "1px 1px 10px rgba(0,0,0, 0.1), 0 0 10px rgba(0,0,0, 0.1)",
              letterSpacing: "0.02em",
            }}
          >
           {/*  <div className="flex items-center justify-center gap-2">
              <span>{`${tempUnit === 'F' ? Math.round((weather.temperature * 9/5) + 32) : Math.round(weather.temperature)}°${tempUnit}`}</span>
              <span className="opacity-80">{getWeatherIcon(weather.icon)}</span>
              <span className="capitalize opacity-80">{weather.description}</span>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clock;
