import React, { useEffect } from "react";
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
    name: "Indigo Purple Pink",
    value: "from-indigo-600 via-purple-600 to-pink-600",
  },
  { name: "Blue Cyan Teal", value: "from-blue-600 via-cyan-600 to-teal-600" },
  {
    name: "Amber Orange Red",
    value: "from-amber-600 via-orange-600 to-red-600",
  },
  {
    name: "Emerald Teal Cyan",
    value: "from-emerald-600 via-teal-600 to-cyan-600",
  },
  {
    name: "Violet Purple Fuchsia",
    value: "from-violet-600 via-purple-600 to-fuchsia-600",
  },
  { name: "Slate Gray Zinc", value: "from-slate-700 via-gray-700 to-zinc-700" },
];

const SOLID_COLOR_OPTIONS = [
  { name: "Indigo", value: "bg-indigo-700" },
  { name: "Blue", value: "bg-blue-700" },
  { name: "Amber", value: "bg-amber-700" },
  { name: "Emerald", value: "bg-emerald-700" },
  { name: "Violet", value: "bg-violet-700" },
  { name: "Slate", value: "bg-slate-800" },
];

interface ThemeBackgroundDrawerProps {
  theme: string;
  onThemeChange: (theme: string) => void;
  backgroundType: "image" | "gradient" | "solid";
  onBackgroundTypeChange: (type: "image" | "gradient" | "solid") => void;
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
  const [storedBackgroundType, setStoredBackgroundType] = useLocalStorage<"image" | "gradient" | "solid">("backgroundType", backgroundType);
  const [storedBackgroundStyle, setStoredBackgroundStyle] = useLocalStorage("backgroundStyle", backgroundStyle);

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

  // Handle background type change with local storage
  const handleBackgroundTypeChange = (newType: "image" | "gradient" | "solid") => {
    setStoredBackgroundType(newType);
    onBackgroundTypeChange(newType);
  };

  // Handle background style change with local storage
  const handleBackgroundStyleChange = (newStyle: string) => {
    setStoredBackgroundStyle(newStyle);
    onBackgroundStyleChange(newStyle);
  };

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
                    handleBackgroundTypeChange(
                      option.value as "image" | "gradient" | "solid"
                    )
                  }
                  className={cn(
                    "group flex-1 flex flex-col items-center justify-center p-3 rounded-lg transition-all relative overflow-hidden",
                    storedBackgroundType === option.value
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-800/50 text-white/70 hover:bg-zinc-700/50"
                  )}
                >
                  {/* Preview background for gradient button */}
                  {option.value === "gradient" && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
                  )}

                  {/* Preview background for image button */}
                  {option.value === "image" && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage:
                            "url(https://source.unsplash.com/random/800x600?nature)",
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30" />
                    </div>
                  )}

                  {/* Preview background for solid button */}
                  {option.value === "solid" && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-700" />
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
              {storedBackgroundType === "image"
                ? "Image Options"
                : storedBackgroundType === "gradient"
                ? "Gradient Options"
                : "Color Options"}
            </h4>

            <div className="overflow-x-auto -mx-6 px-6">
              <div className="flex gap-3 min-w-96 pb-4">
                {storedBackgroundType === "image" ? (
                  <>
                    <button
                      key="shuffle"
                      onClick={onShuffleImage}
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
                ) : storedBackgroundType === "gradient" ? (
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
