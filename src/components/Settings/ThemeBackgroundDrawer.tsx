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
    value: "from-black/50 via-gray-900/50 to-gray-900/50",
  },
  {
    name: "Emerald Teal Cyan",
    value: "from-emerald-700/60 via-teal-700/60 to-cyan-700/60",
  },
  {
    name: "Violet Purple Fuchsia",
    value: "from-violet-600/60 via-purple-600/60 to-fuchsia-600/60",
  },
  { name: "Slate Gray Zinc", value: "from-slate-700 via-gray-700 to-zinc-700" },
  {
    name: "Blue Cyan Teal",
    value: "from-blue-700/60 via-cyan-700/60 to-teal-700/60",
  },
];

const SOLID_COLOR_OPTIONS = [
  { name: "Black", value: "bg-black/50" },
  { name: "Indigo", value: "bg-indigo-700/50" },
  { name: "Blue", value: "bg-blue-200/60" },
  { name: "Amber", value: "bg-amber-100/40" },
  { name: "Emerald", value: "bg-emerald-700/50" },
  { name: "Violet", value: "bg-violet-700/50" },
  { name: "Slate", value: "bg-slate-800" },
];

// Dynamic background options
const DYNAMIC_OPTIONS = [
  { name: "Morning Coffee", value: "morning-coffee.mp4" },
];

interface ThemeBackgroundDrawerProps {
  theme: string;
  onThemeChange: (theme: string) => void;
  backgroundType: "image" | "gradient" | "solid" | "dynamic";
  onBackgroundTypeChange: (type: "image" | "gradient" | "solid" | "dynamic") => void;
  backgroundStyle: string;
  onBackgroundStyleChange: (style: string) => void;
  onShuffleImage: () => void;
}

const ThemeBackgroundDrawer: React.FC<ThemeBackgroundDrawerProps> = ({
  theme,
  onThemeChange,
  backgroundType,
  onBackgroundTypeChange,
  backgroundStyle,
  onBackgroundStyleChange,
  onShuffleImage,
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

  // Determine which background type to display in the UI
  const displayBackgroundType = selectedBackgroundType || storedBackgroundType;

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          className="p-2 top-14 right-3 transition-all z-10 flex items-center justify-center
             dark:hover:bg-black/30 dark:active:bg-black/40 active:bg-black/40
            text-white/90 hover:text-white
            border-white/10 hover:border-white/20
            shadow-sm hover:shadow-md absolute rounded-full  text-white backdrop-blur-md hover:bg-black/30"
          title="Theme & Background Settings"
        >
          <PaletteIcon className="h-4 w-4" />
        </button>
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
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center p-3 rounded-lg transition-all",
                    storedTheme === option.value
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-800/50 text-white/70 hover:bg-zinc-700/50"
                  )}
                >
                  {option.icon}
                  <span className="mt-2 text-xs">{option.name}</span>
                </button>
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
                <button
                  key={option.value}
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
                            backgroundImage: "url(/backgrounds/static/image.jpg)",
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
                          backgroundImage: "url(/backgrounds/dynamic/clouds.gif)",
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

            <div className="overflow-x-auto -mx-6 px-6">
              <div className="flex gap-3 min-w-96 pb-4">
                {displayBackgroundType === "image" ? (
                  <>
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
                        "ring-2 ring-white"
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
                  </>
                ) : displayBackgroundType === "gradient" ? (
                  GRADIENT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleBackgroundStyleChange(option.value)}
                      className={cn(
                        "group relative size-10 mt-1 rounded-full transition-all flex-shrink-0",
                        `bg-gradient-to-br ${option.value}`,
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
                  ))
                ) : displayBackgroundType === "dynamic" ? (
                  DYNAMIC_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleBackgroundStyleChange(option.value)}
                      className={cn(
                        "group relative size-10 mt-1 rounded-full transition-all flex-shrink-0",
                        "bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20",
                        "text-white/90 hover:text-white",
                        "border border-white/10 hover:border-white/20",
                        "shadow-sm hover:shadow-md",
                        "flex items-center justify-center",
                        storedBackgroundStyle === option.value
                          ? "ring-2 ring-white"
                          : "ring-1 ring-white/20 hover:ring-white/40"
                      )}
                    >
                      <Play className="h-4 w-4" />
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                          "bg-gradient-to-b from-white/10 to-transparent"
                        )}
                      />
                    </button>
                  ))
                ) : (
                  SOLID_COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.value}
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
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ThemeBackgroundDrawer;
