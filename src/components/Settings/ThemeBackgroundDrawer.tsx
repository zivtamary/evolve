import React from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Settings2, Sun, Moon, Monitor, Image, Palette, Waves, Shuffle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

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
  { name: "Indigo Purple Pink", value: "from-indigo-600 via-purple-600 to-pink-600" },
  { name: "Blue Cyan Teal", value: "from-blue-600 via-cyan-600 to-teal-600" },
  { name: "Amber Orange Red", value: "from-amber-600 via-orange-600 to-red-600" },
  { name: "Emerald Teal Cyan", value: "from-emerald-600 via-teal-600 to-cyan-600" },
  { name: "Violet Purple Fuchsia", value: "from-violet-600 via-purple-600 to-fuchsia-600" },
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
  backgroundType: 'image' | 'gradient' | 'solid';
  onBackgroundTypeChange: (type: 'image' | 'gradient' | 'solid') => void;
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
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-black/20 dark:bg-transparent text-white p-2 rounded-full backdrop-blur-md hover:bg-black/30 transition-colors z-10"
          title="Theme & Background Settings"
        >
          <Settings2 className="h-5 w-5" />
        </Button>
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
              {THEME_OPTIONS.map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => onThemeChange(option.value)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center p-3 rounded-lg transition-all",
                    theme === option.value
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-800/50 text-white/70 hover:bg-zinc-700/50"
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {option.icon}
                  <span className="mt-2 text-xs">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="h-px w-full bg-white/10 mb-8" />
          
          {/* Background Type Selection */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-white/70 mb-3">Background Type</h4>
            <div className="flex gap-3">
              {BACKGROUND_TYPE_OPTIONS.map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => onBackgroundTypeChange(option.value as 'image' | 'gradient' | 'solid')}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center p-3 rounded-lg transition-all",
                    backgroundType === option.value
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-800/50 text-white/70 hover:bg-zinc-700/50"
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {option.icon}
                  <span className="mt-2 text-xs">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Background Options */}
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3">
              {backgroundType === 'image' 
                ? 'Image Options' 
                : backgroundType === 'gradient' 
                  ? 'Gradient Options' 
                  : 'Color Options'}
            </h4>
            
            <div className="overflow-x-auto -mx-6 px-6">
              <div className="flex gap-3 min-w-96 pb-4">
                {backgroundType === 'image' ? (
                  IMAGE_OPTIONS.map((option, index) => (
                    <motion.button
                      key={option.value}
                      onClick={onShuffleImage}
                      className={cn(
                        "group relative size-10 mt-1 rounded-full transition-all flex-shrink-0",
                        "bg-zinc-800/50 text-white/70 hover:bg-zinc-700/50",
                        "flex items-center justify-center"
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {option.icon}
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                          "bg-gradient-to-b from-white/10 to-transparent"
                        )}
                      />
                    </motion.button>
                  ))
                ) : backgroundType === 'gradient' ? (
                  GRADIENT_OPTIONS.map((option, index) => (
                    <motion.button
                      key={option.value}
                      onClick={() => onBackgroundStyleChange(option.value)}
                      className={cn(
                        "group relative size-10 mt-1 rounded-full transition-all flex-shrink-0",
                        `bg-gradient-to-br ${option.value}`,
                        backgroundStyle === option.value
                          ? "ring-2 ring-white"
                          : "ring-1 ring-white/20 hover:ring-white/40"
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                          "bg-gradient-to-b from-white/10 to-transparent"
                        )}
                      />
                    </motion.button>
                  ))
                ) : (
                  SOLID_COLOR_OPTIONS.map((option, index) => (
                    <motion.button
                      key={option.value}
                      onClick={() => onBackgroundStyleChange(option.value)}
                      className={cn(
                        "group relative size-10 mt-1 rounded-full transition-all flex-shrink-0",
                        option.value,
                        backgroundStyle === option.value
                          ? "ring-2 ring-white"
                          : "ring-1 ring-white/20 hover:ring-white/40"
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div
                        className={cn(
                          "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                          "bg-gradient-to-b from-white/10 to-transparent"
                        )}
                      />
                    </motion.button>
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