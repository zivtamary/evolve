import React, { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Settings2,
  Sun,
  Moon,
  Monitor,
  Image,
  Palette,
  Waves,
  Shuffle,
  SettingsIcon,
  PaletteIcon,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";

// Theme options
const THEME_OPTIONS = [
  { name: "Light", value: "light", icon: <Sun className="w-5 h-5" /> },
  { name: "Dark", value: "dark", icon: <Moon className="w-5 h-5" /> },
  { name: "System", value: "system", icon: <Monitor className="w-5 h-5" /> },
];

// Background type options
const BACKGROUND_TYPE_OPTIONS = [
  { name: "Image", value: "image", icon: <Image className="w-5 h-5" /> },
  { name: "Dynamic", value: "dynamic", icon: <Play className="w-5 h-5" /> },
  { name: "Gradient", value: "gradient", icon: <Waves className="w-5 h-5" /> },
  { name: "Solid", value: "solid", icon: <Palette className="w-5 h-5" /> },
];

// Image options
const IMAGE_OPTIONS = [
  { name: "Shuffle", value: "shuffle", icon: <Shuffle className="w-4 h-4" /> },
];

// Background color options
const GRADIENT_OPTIONS = [
  {
    name: "Black and Gray",
    value: "bg-gradient-to-br from-black/50 via-gray-900/50 to-gray-900/50",
  },
  {
    name: "Emerald Teal Cyan",
    value: "bg-gradient-to-br from-emerald-700/60 via-teal-700/60 to-cyan-700/60",
  },
  {
    name: "Violet Purple Fuchsia",
    value: "bg-gradient-to-br from-violet-600/60 via-purple-600/60 to-fuchsia-600/60",
  },
  { name: "Slate Gray Zinc", value: "bg-gradient-to-br from-slate-700 via-gray-700 to-zinc-700" },
  {
    name: "Blue Cyan Teal",
    value: "bg-gradient-to-br from-blue-700/60 via-cyan-700/60 to-teal-700/60",
  },
  {
    name: "Peach like color and Strong sky blue",
    value: "bg-gradient-to-tl from-[#ffafcc] to-[#a2d2ff]",
  }
];

const SOLID_COLOR_OPTIONS = [
  { name: "Nastia's Choice 1", value: "bg-[#ffafcc]" },
//   { name: "Nastia's Choice 2", value: "bg-[#a2d2ff]" },
  { name: "Nastia's Choice 3", value: "bg-[#d5bdaf]" },
  { name: "Nastia's Choice 4", value: "bg-[#b0c4b1]" },
//   { name: "Nastia's Choice 5", value: "bg-[#adc178]" },
  { name: "Nastia's Choice 6", value: "bg-[#9b72cf]" },
//   { name: "Nastia's Choice 7", value: "bg-[#8ecae6]" },
//   { name: "Nastia's Choice 8", value: "bg-[#ef8354]" },
  { name: "Black", value: "bg-gray-950" },
//   { name: "Indigo", value: "bg-indigo-700/50" },
  { name: "Blue", value: "bg-blue-200/60" },
//   { name: "Amber", value: "bg-amber-100/40" },
//   { name: "Emerald", value: "bg-emerald-700/50" },
  { name: "Violet", value: "bg-violet-700/50" },
  { name: "Slate", value: "bg-slate-800" },
];

// Dynamic background options
export const DYNAMIC_OPTIONS = [
  { 
    name: "Sunny Patio", 
    value: "https://fdcqozqhcmrvwzhkprwz.supabase.co/storage/v1/object/sign/evolve/dynamic/sunny-patio.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJldm9sdmUvZHluYW1pYy9zdW5ueS1wYXRpby5tcDQiLCJpYXQiOjE3NDQ1NzEwNDcsImV4cCI6MTc3NjEwNzA0N30.e3hCeqZkePhOhHI_EdK0M8KKRmba5eB5viGloH56x1A",
    effects: "object-cover blur-sm contrast-125"
  },
  { 
    name: "Rainy Bedroom", 
    value: "https://fdcqozqhcmrvwzhkprwz.supabase.co/storage/v1/object/sign/evolve/dynamic/rainy-bedroom.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJldm9sdmUvZHluYW1pYy9yYWlueS1iZWRyb29tLm1wNCIsImlhdCI6MTc0NDU3MTAzOSwiZXhwIjoxNzc2MTA3MDM5fQ.HmWP5-gqPuZ-HeqeQ3SFTeoq9WfR6jHENMsaw1XO3QI",
    effects: "object-cover blur-sm contrast-125"
  },
  { 
    name: "Cyberpunk Room", 
    value: "https://fdcqozqhcmrvwzhkprwz.supabase.co/storage/v1/object/sign/evolve/dynamic/cyberpunk-room.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJldm9sdmUvZHluYW1pYy9jeWJlcnB1bmstcm9vbS5tcDQiLCJpYXQiOjE3NDQ1NzEwMjksImV4cCI6MTc3NjEwNzAyOX0.QbBuP9baZTB9VXdDLUrJFG8nX5EiZkqaGZsmXOJBWmA",
    effects: "object-cover blur-sm contrast-125"
  },
  { 
    name: "Botanica", 
    value: "https://fdcqozqhcmrvwzhkprwz.supabase.co/storage/v1/object/sign/evolve/dynamic/botanica.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJldm9sdmUvZHluYW1pYy9ib3RhbmljYS5tcDQiLCJpYXQiOjE3NDQ1NzEwMTksImV4cCI6MTc3NjEwNzAxOX0.hUB2W22IYh72VfCN8195RPtTSj90B3NpY0szL6dYkdc",
    effects: "object-cover blur-sm contrast-125"
  },
  { 
    name: "Anime Coffee Shop", 
    value: "https://fdcqozqhcmrvwzhkprwz.supabase.co/storage/v1/object/sign/evolve/dynamic/anime-coffee-shop.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJldm9sdmUvZHluYW1pYy9hbmltZS1jb2ZmZWUtc2hvcC5tcDQiLCJpYXQiOjE3NDQ1NzA5OTgsImV4cCI6MTc3NjEwNjk5OH0.BabEKikGedP2LnKpfezJ8komRxo0ebviJCJ9o5icXyU",
    effects: "object-cover blur-sm contrast-125"
  },
];

interface ThemeBackgroundDrawerProps {
  theme: string;
  onThemeChange: (theme: string) => void;
  backgroundType: "image" | "gradient" | "solid" | "dynamic";
  onBackgroundTypeChange: (type: "image" | "gradient" | "solid" | "dynamic") => void;
  backgroundStyle: string;
  onBackgroundStyleChange: (style: string) => void;
  onShuffleImage: () => void;
  blurLevel: number;
  onBlurLevelChange: (level: number) => void;
}

const ThemeBackgroundDrawer: React.FC<ThemeBackgroundDrawerProps> = ({
  theme,
  onThemeChange,
  backgroundType,
  onBackgroundTypeChange,
  backgroundStyle,
  onBackgroundStyleChange,
  onShuffleImage,
  blurLevel,
  onBlurLevelChange,
}) => {
  // Use local storage hooks for each setting
  const [storedTheme, setStoredTheme] = useLocalStorage("theme", theme);
  const [storedBackgroundType, setStoredBackgroundType] = useLocalStorage<
    "image" | "gradient" | "solid" | "dynamic"
  >("backgroundType", backgroundType);
  const [storedBackgroundStyle, setStoredBackgroundStyle] = useLocalStorage(
    "backgroundStyle",
    backgroundStyle
  );
  const [storedBlurLevel, setStoredBlurLevel] = useLocalStorage(
    "blurLevel",
    blurLevel
  );
  
  // Add temporary state for selected background type
  const [selectedBackgroundType, setSelectedBackgroundType] = useState<
    "image" | "gradient" | "solid" | "dynamic" | null
  >(null);

  // Sync stored values with props when component mounts
  useEffect(() => {
    // Only update if stored values are different from props
    if (storedTheme !== theme) {
      onThemeChange(storedTheme);
    }
    if (storedBackgroundType !== backgroundType) {
      onBackgroundTypeChange(storedBackgroundType);
    }
    if (storedBackgroundStyle !== backgroundStyle) {
      onBackgroundStyleChange(storedBackgroundStyle);
    }
    if (storedBlurLevel !== blurLevel) {
      onBlurLevelChange(storedBlurLevel);
    }
  }, []);

  // Handle theme change with local storage
  const handleThemeChange = (newTheme: string) => {
    setStoredTheme(newTheme);
    onThemeChange(newTheme);
  };

  // Handle background type selection (temporary, not applied yet)
  const handleBackgroundTypeSelect = (
    newType: "image" | "gradient" | "solid" | "dynamic"
  ) => {
    setSelectedBackgroundType(newType);
  };

  // Handle background style change with local storage and apply background type
  const handleBackgroundStyleChange = (newStyle: string) => {
    setStoredBackgroundStyle(newStyle);
    onBackgroundStyleChange(newStyle);
    
    // If we have a selected background type, apply it now
    if (selectedBackgroundType) {
      setStoredBackgroundType(selectedBackgroundType);
      onBackgroundTypeChange(selectedBackgroundType);
      setSelectedBackgroundType(null); // Reset the selection
    }
  };

  // Handle image shuffle with background type application
  const handleShuffleImage = () => {
    onShuffleImage();
    
    // If we have a selected background type, apply it now
    if (selectedBackgroundType) {
      setStoredBackgroundType(selectedBackgroundType);
      onBackgroundTypeChange(selectedBackgroundType);
      setSelectedBackgroundType(null); // Reset the selection
    }
  };

  // Handle blur level change
  const handleBlurLevelChange = (newLevel: number[]) => {
    setStoredBlurLevel(newLevel[0]);
    onBlurLevelChange(newLevel[0]);
  };

  // Determine which background type to display in the UI
  const displayBackgroundType = selectedBackgroundType || storedBackgroundType;

  return (
    <Drawer>
      <DrawerTrigger>
        <TooltipProvider>
        <Tooltip>
        <TooltipTrigger asChild>
        <button
          className="p-2 top-14 right-3 transition-all z-10 flex items-center justify-center
             dark:hover:bg-black/30 dark:active:bg-black/40 active:bg-black/40
            text-white/90 hover:text-white
            border-white/10 hover:border-white/20
            shadow-sm hover:shadow-md absolute rounded-full  text-white backdrop-blur-md hover:bg-black/30"
        >
          <PaletteIcon className="h-4 w-4" />
        </button>
        </TooltipTrigger>
        <TooltipContent side="left" children="Theme & Background Settings" />
        </Tooltip>
        </TooltipProvider>

      </DrawerTrigger>
      <DrawerContent className="bg-transparent backdrop-blur-xl border-t border-white/5">
        <div className="max-w-md mx-auto px-6 py-4">
          <h3 className="text-base font-medium text-white text-center mb-8">
            Theme & Background Settings
          </h3>

          {/* Theme Selection */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-white/70 mb-3">Theme</h4>
            <div className="flex gap-3">
              {THEME_OPTIONS.map((option) => (
                <TooltipProvider key={option.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleThemeChange(option.value)}
                        className={cn(
                          "flex-1 flex flex-col items-center justify-center p-3 rounded-lg transition-all",
                          storedTheme === option.value
                            ? "bg-zinc-700 text-white"
                            : "bg-zinc-800 text-white/70 hover:bg-zinc-800/50"
                        )}
                      >
                        {option.icon}
                        <span className="mt-2 text-xs">{option.name}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set theme to {option.name.toLowerCase()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-white/10 mb-8" />

          {/* Background Type Selection */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-white/70 mb-3">
              Background Type
            </h4>
            <div className="flex gap-3">
              {BACKGROUND_TYPE_OPTIONS.map((option) => (
                <TooltipProvider key={option.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() =>
                          handleBackgroundTypeSelect(
                            option.value as "image" | "gradient" | "solid" | "dynamic"
                          )
                        }
                        className={cn(
                          "group flex-1 flex flex-col items-center justify-center p-3 rounded-lg transition-all relative overflow-hidden",
                          displayBackgroundType === option.value
                            ? "bg-zinc-700 text-white"
                            : "bg-zinc-800/50 text-white/70 hover:bg-zinc-700/50"
                        )}
                      >
                        {/* Preview background for gradient button */}
                        {option.value === "gradient" && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-600" />
                        )}

                        {/* Preview background for image button */}
                        {option.value === "image" && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div
                              className="absolute inset-0 bg-cover bg-center"
                              style={{
                                  backgroundImage: "url(https://fdcqozqhcmrvwzhkprwz.supabase.co/storage/v1/object/sign/evolve/static/thumbnail.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJldm9sdmUvc3RhdGljL3RodW1ibmFpbC5qcGciLCJpYXQiOjE3NDQ1NzEzMzUsImV4cCI6MTc3NjEwNzMzNX0.4DuXQrBgnold15oG4oGfxLYL8nRKVJZy1WHraA53Euo)",
                              }}
                            />
                            <div className="absolute inset-0 bg-black/30" />
                          </div>
                        )}

                        {/* Preview background for solid button */}
                        {option.value === "solid" && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600" />
                        )}

                        {/* Preview background for dynamic button */}
                        {option.value === "dynamic" && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div
                              className="absolute inset-0 bg-cover bg-center"
                              style={{
                                backgroundImage: "url(https://fdcqozqhcmrvwzhkprwz.supabase.co/storage/v1/object/sign/evolve/dynamic/thumbnail.gif?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJldm9sdmUvZHluYW1pYy90aHVtYm5haWwuZ2lmIiwiaWF0IjoxNzQ0NTcxMzAwLCJleHAiOjE3NzYxMDczMDB9.k7NcX7ik7NQ6EKqbqHpH9-pk6dulBYO8qP2b4IwmebE)",
                              }}
                            />
                            <div className="absolute inset-0 bg-black/30" />
                          </div>
                        )}

                        {/* Content with z-index to appear above the preview */}
                        <div className="relative z-10 flex flex-col items-center">
                          {option.icon}
                          <span className="mt-2 text-xs">{option.name}</span>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Use {option.name.toLowerCase()} background</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Background Options */}
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3">
              {displayBackgroundType === "image"
                ? "Image Options"
                : displayBackgroundType === "gradient"
                ? "Gradient Options"
                : displayBackgroundType === "dynamic"
                ? "Dynamic Options"
                : "Color Options"}
            </h4>

            <div className="-mx-6 px-6 overflow-x-auto w-full min-w-[40rem] max-w-md">
              <div className="flex gap-3 pb-4">
                {displayBackgroundType === "image" ? (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            key="shuffle"
                            onClick={handleShuffleImage}
                            className={cn(
                              "group relative size-10 mt-1 rounded-full transition-all flex-shrink-0",
                              "bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20",
                              "text-white/90 hover:text-white",
                              "border border-white/10 hover:border-white/20",
                              "shadow-sm hover:shadow-md",
                              "flex items-center justify-center",
                              backgroundType === "image"
                                ? "ring-2 ring-white"
                                : "ring-1 ring-white/20 hover:ring-white/40"
                            )}
                          >
                            <Shuffle className="h-4 w-4" />
                            <div
                              className={cn(
                                "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                                "bg-gradient-to-b from-white/10 to-transparent"
                              )}
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Shuffle background image</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                ) : displayBackgroundType === "gradient" ? (
                  GRADIENT_OPTIONS.map((option) => (
                    <TooltipProvider key={option.value}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleBackgroundStyleChange(option.value)}
                            className={cn(
                              "group relative size-10 mt-1 rounded-full transition-all flex-shrink-0",
                              `${option.value}`,
                              storedBackgroundStyle === option.value
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
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{option.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))
                ) : displayBackgroundType === "dynamic" ? (
                    <TooltipProvider key={DYNAMIC_OPTIONS[0].value}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleBackgroundStyleChange(DYNAMIC_OPTIONS[0].value)}
                          className={cn(
                            "group relative size-10 mt-1 rounded-full transition-all flex-shrink-0",
                            "bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20",
                            "text-white/90 hover:text-white",
                            "border border-white/10 hover:border-white/20",
                            "shadow-sm hover:shadow-md",
                            "flex items-center justify-center",
                            backgroundType === "dynamic"
                              ? "ring-2 ring-white"
                              : "ring-1 ring-white/20 hover:ring-white/40"
                          )}
                        >
                          <Shuffle className="h-4 w-4" />
                          <div
                            className={cn(
                              "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                              "bg-gradient-to-b from-white/10 to-transparent"
                            )}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Shuffle Dynamic Background</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  SOLID_COLOR_OPTIONS.map((option) => (
                    <TooltipProvider key={option.value}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleBackgroundStyleChange(option.value)}
                            className={cn(
                              "group relative size-10 mt-1 rounded-full transition-all flex-shrink-0",
                              option.value,
                              storedBackgroundStyle === option.value
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
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{option.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Extra Options - Only visible for image background type */}
          {displayBackgroundType === "image" && (
            <>
              {/* <div className="h-px w-full bg-white/10 my-2" /> */}
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white/70 mb-3">
                  Extra Options
                </h4>
                
                <div className="space-y-6">
                  {/* Blur Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm text-white/70">Blur</label>
                      <span className="text-sm text-white/70">
                        {storedBlurLevel === 0 ? "None" : storedBlurLevel === 1 ? "Low" : storedBlurLevel === 2 ? "Medium" : "High"}
                      </span>
                    </div>
                    <Slider
                      value={[storedBlurLevel]}
                      onValueChange={handleBlurLevelChange}
                      max={3}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>

  );
};

export default ThemeBackgroundDrawer;
