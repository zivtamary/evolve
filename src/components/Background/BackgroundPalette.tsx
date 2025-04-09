import React from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Palette, Image, Waves, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from "@/lib/utils";

const pastelGradients = [
  'from-indigo-600 via-purple-600 to-pink-600',
  'from-blue-600 via-cyan-600 to-teal-600',
  'from-amber-600 via-orange-600 to-red-600',
  'from-emerald-600 via-teal-600 to-cyan-600',
  'from-violet-600 via-purple-600 to-fuchsia-600',
  'from-slate-700 via-gray-700 to-zinc-700'
];

const pastelColors = [
  'bg-indigo-700',
  'bg-blue-700',
  'bg-amber-700',
  'bg-emerald-700',
  'bg-violet-700',
  'bg-slate-800'
];

interface BackgroundPaletteProps {
  currentType: 'image' | 'gradient' | 'solid';
  onTypeChange: (type: 'image' | 'gradient' | 'solid') => void;
  onSelect: (className: string) => void;
}

const BackgroundPalette: React.FC<BackgroundPaletteProps> = ({
  currentType,
  onTypeChange,
  onSelect,
}) => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const renderThemeOptions = () => (
    <div className="space-y-4">
      <h3 className="text-base font-medium text-white text-center mb-4">
        Theme
      </h3>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => handleThemeChange('light')}
          className={cn(
            "group relative w-10 h-10 rounded-full transition-all flex-shrink-0 bg-white",
            theme === 'light' ? "ring-2 ring-white" : "ring-1 ring-white/20 hover:ring-white/40"
          )}
          title="Light theme"
        >
          <Sun className="w-5 h-5 mx-auto mt-2.5 text-black" />
        </button>
        <button
          onClick={() => handleThemeChange('dark')}
          className={cn(
            "group relative w-10 h-10 rounded-full transition-all flex-shrink-0 bg-black",
            theme === 'dark' ? "ring-2 ring-white" : "ring-1 ring-white/20 hover:ring-white/40"
          )}
          title="Dark theme"
        >
          <Moon className="w-5 h-5 mx-auto mt-2.5 text-white" />
        </button>
        <button
          onClick={() => handleThemeChange('system')}
          className={cn(
            "group relative w-10 h-10 rounded-full transition-all flex-shrink-0 bg-gradient-to-br from-white to-black",
            theme === 'system' ? "ring-2 ring-white" : "ring-1 ring-white/20 hover:ring-white/40"
          )}
          title="System theme"
        >
          <Monitor className="w-5 h-5 mx-auto mt-2.5 text-white" />
        </button>
      </div>
    </div>
  );

  const renderBackgroundOptions = () => (
    <div className="space-y-4">
      <h3 className="text-base font-medium text-white text-center mb-4">
        Background Type
      </h3>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => onTypeChange('image')}
          className={cn(
            "group relative w-10 h-10 rounded-full transition-all flex-shrink-0 bg-black/20",
            currentType === 'image' ? "ring-2 ring-white" : "ring-1 ring-white/20 hover:ring-white/40"
          )}
          title="Image background"
        >
          <Image className="w-5 h-5 mx-auto mt-2.5 text-white" />
        </button>
        <button
          onClick={() => onTypeChange('gradient')}
          className={cn(
            "group relative w-10 h-10 rounded-full transition-all flex-shrink-0 bg-gradient-to-br from-indigo-600 to-pink-600",
            currentType === 'gradient' ? "ring-2 ring-white" : "ring-1 ring-white/20 hover:ring-white/40"
          )}
          title="Gradient background"
        >
          <Waves className="w-5 h-5 mx-auto mt-2.5 text-white" />
        </button>
        <button
          onClick={() => onTypeChange('solid')}
          className={cn(
            "group relative w-10 h-10 rounded-full transition-all flex-shrink-0 bg-indigo-700",
            currentType === 'solid' ? "ring-2 ring-white" : "ring-1 ring-white/20 hover:ring-white/40"
          )}
          title="Solid background"
        >
          <Palette className="w-5 h-5 mx-auto mt-2.5 text-white" />
        </button>
      </div>
    </div>
  );

  const renderColorOptions = () => {
    if (currentType === 'image') return null;

    const colors = currentType === 'gradient' ? pastelGradients : pastelColors;

    return (
      <div className="space-y-4">
        <h3 className="text-base font-medium text-white text-center mb-4">
          {currentType === 'gradient' ? 'Gradient' : 'Solid'} Colors
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {colors.map((color, index) => (
            <button
              key={index}
              onClick={() => onSelect(color)}
              className={cn(
                "group relative w-10 h-10 rounded-full transition-all flex-shrink-0",
                currentType === 'gradient' ? `bg-gradient-to-br ${color}` : color,
                "ring-1 ring-white/20 hover:ring-white/40"
              )}
              title={`Select ${currentType} ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-14 right-4 bg-black/20 dark:bg-transparent text-white p-2 rounded-full backdrop-blur-md hover:bg-black/30 transition-colors z-10"
          title="Background & Theme Settings"
        >
          <Palette className="w-5 h-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-transparent backdrop-blur-xl border-t border-white/5">
        <div className="max-w-md mx-auto px-6 py-4 space-y-8">
          {renderThemeOptions()}
          <div className="h-px w-full bg-white/10" />
          {renderBackgroundOptions()}
          <div className="h-px w-full bg-white/10" />
          {renderColorOptions()}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default BackgroundPalette; 