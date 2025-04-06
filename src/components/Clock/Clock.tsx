import React, { useState, useEffect } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Baseline, Edit, Pen, Settings2 } from "lucide-react";

interface ClockProps {
  className?: string;
}

type ClockType = "digital-12h" | "digital-24h" | "analog";

interface ClockStyle {
  font: string;
  color: string;
}

const FONT_OPTIONS = [
  { name: "SF Pro", value: 'font-["SF_Pro_Display"]', preview: "12" },
  { name: "Space Grotesk", value: 'font-["Space_Grotesk"]', preview: "12" },
  { name: "Inter", value: 'font-["Inter"]', preview: "12" },
  { name: "Roboto", value: 'font-["Roboto"]', preview: "12" },
  { name: "System", value: "font-sans", preview: "12" },
];

const COLOR_OPTIONS = [
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
    "digital-12h"
  );
  const [clockStyle, setClockStyle] = useLocalStorage<ClockStyle>(
    "clock-style",
    {
      font: FONT_OPTIONS[0].value,
      color: COLOR_OPTIONS[0].value,
    }
  );

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
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
        return "Switch to 24h format";
      case "digital-24h":
        return "Switch to analog clock";
      case "analog":
        return "Switch to 12h format";
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
          className="absolute w-1.5 h-12 bg-white rounded-full"
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
          className="absolute w-1 h-16 bg-white/90 rounded-full"
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
          Font & Color
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
                "font-light tracking-tight cursor-pointer text-5xl sm:text-7xl lg:text-8xl transition-all hover:opacity-90"
              )}
              style={{
                textShadow:
                  "2px 2px 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.2)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.02em",
              }}
              onClick={toggleClockType}
            >
              {formatTime(time)}
            </h1>
            <div className="absolute -right-8 sm:-right-10 top-2 sm:top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={toggleClockType}
                    className="text-white/70 hover:text-white text-sm p-1.5 sm:p-0"
                    title={getClockTypeTitle()}
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
                </div>
            <Drawer>
              <DrawerTrigger asChild>
                <div className="absolute -right-8 sm:-right-10 top-9 sm:top-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="text-white/70 hover:text-white text-sm p-1.5 sm:p-0"
                  >
                   <Settings2 className="w-4 h-4" />
                  </button>
                </div>
              </DrawerTrigger>
              {renderStyleOptions()}
            </Drawer>
          </div>
        )}
      </div>
      <p
        className={cn(
          clockStyle.font,
          clockStyle.color,
          "mt-3 sm:mt-4 text-lg sm:text-2xl font-light tracking-wide opacity-70"
        )}
        style={{
          textShadow:
            "1px 1px 10px rgba(255, 255, 255, 0.2), 0 0 20px rgba(255, 255, 255, 0.1)",
          letterSpacing: "0.02em",
        }}
      >
        {formatDate(time)}
      </p>
    </div>
  );
};

export default Clock;
