import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Timer, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSettings } from '../../context/SettingsContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const TIMER_SETTINGS = {
  work: { minutes: 25, label: 'Focus' },
  shortBreak: { minutes: 5, label: 'Short Break' },
  longBreak: { minutes: 15, label: 'Long Break' },
};

interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessions: number;
  alarmSound: string;
  volume: number;
}

const ALARM_SOUNDS = [
  { value: 'alarm-1.mp3', label: 'Alarm 1' },
  { value: 'alarm-2.mp3', label: 'Alarm 2' },
  { value: 'alarm-3.mp3', label: 'Alarm 3' },
];

const Pomodoro: React.FC = () => {
  const { syncPomodoroOnBlur } = useSettings();
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>('pomodoro-settings', {
    workDuration: 0.05,
    breakDuration: 5,
    longBreakDuration: 15,
    sessions: 4,
    alarmSound: 'alarm-1.mp3',
    volume: 0.5
  });
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(`/sounds/${settings.alarmSound}`);
    audioRef.current.volume = settings.volume;

    // Cleanup function to stop audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [settings.alarmSound]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.volume;
    }
  }, [settings.volume]);

  // Reset timer when mode changes
  useEffect(() => {
    const duration = mode === 'work' 
      ? settings.workDuration 
      : mode === 'shortBreak' 
        ? settings.breakDuration 
        : settings.longBreakDuration;
    setTimeLeft(duration * 60);
    setIsActive(false);
    
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [mode, settings.workDuration, settings.breakDuration, settings.longBreakDuration]);
  
  // Handle timer countdown
  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer completed
            setIsActive(false);
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);
  
  const stopSound = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const toggleTimer = () => {
    stopSound();
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    stopSound();
    setIsActive(false);
    const duration = mode === 'work' 
      ? settings.workDuration 
      : mode === 'shortBreak' 
        ? settings.breakDuration 
        : settings.longBreakDuration;
    setTimeLeft(duration * 60);
  };
  
  const handleTimerComplete = async () => {
    if (mode === 'work') {
      if (sessionCount + 1 >= settings.sessions) {
        setMode('longBreak');
        setSessionCount(0);
      } else {
        setMode('shortBreak');
        setSessionCount(prev => prev + 1);
      }
    } else {
      setMode('work');
    }

    // Play alarm sound
    if (audioRef.current && settings.volume > 0) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }

    try {
      console.log('Timer completed, attempting to sync...');
      await syncPomodoroOnBlur();
      console.log('Pomodoro sync completed');
    } catch (error) {
      console.error('Error syncing pomodoro:', error);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const previewSound = () => {
    if (audioRef.current) {
      // Stop any currently playing sound
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Handle audio ended event
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Add event listener for audio ended
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleAudioEnded);
      return () => {
        audioRef.current?.removeEventListener('ended', handleAudioEnded);
      };
    }
  }, []);

  // Stop sound when settings modal is closed
  useEffect(() => {
    if (!isSettingsOpen && audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isSettingsOpen]);

  return (
    <div className="glass dark:glass-dark rounded-xl text-white overflow-hidden h-[400px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Pomodoro</h2>
        </div>
        <div className="text-xs text-white/70">
          Session {sessionCount + 1}
        </div>
      </div>

      <div className="flex-1 p-4">
        <Tabs 
          defaultValue="work" 
          value={mode} 
          onValueChange={(value) => {
            stopSound();
            setMode(value as TimerMode);
          }} 
          className="h-full flex flex-col"
        >
          <TabsList className="grid grid-cols-3 bg-black/20 p-1 gap-1 rounded-lg">
            <TabsTrigger 
              value="work" 
              className="rounded data-[state=active]:bg-white/20 data-[state=active]:text-white hover:text-white hover:bg-white/10 text-white/70"
            >
              Focus
            </TabsTrigger>
            <TabsTrigger 
              value="shortBreak"
              className="rounded data-[state=active]:bg-white/20 data-[state=active]:text-white hover:text-white hover:bg-white/10 text-white/70"
            >
              Short Break
            </TabsTrigger>
            <TabsTrigger 
              value="longBreak"
              className="rounded data-[state=active]:bg-white/20 data-[state=active]:text-white hover:text-white hover:bg-white/10 text-white/70"
            >
              Long Break
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-6xl font-light mb-8 font-['Space_Grotesk']" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.2)' }}>
              {formatTime(timeLeft)}
            </div>
            <div className="flex gap-3">
              <button
                onClick={toggleTimer}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
              >
                {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isActive ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={resetTimer}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-white transition-colors">
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-black/90 text-white border-white/10">
                  <DialogHeader>
                    <DialogTitle>Pomodoro Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label>Work Duration (minutes)</Label>
                      <input
                        type="number"
                        value={settings.workDuration}
                        onChange={(e) => setSettings({ ...settings, workDuration: Number(e.target.value) })}
                        className="w-full bg-white/10 rounded px-3 py-2 text-white"
                        min="1"
                        max="60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Short Break Duration (minutes)</Label>
                      <input
                        type="number"
                        value={settings.breakDuration}
                        onChange={(e) => setSettings({ ...settings, breakDuration: Number(e.target.value) })}
                        className="w-full bg-white/10 rounded px-3 py-2 text-white"
                        min="1"
                        max="30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Long Break Duration (minutes)</Label>
                      <input
                        type="number"
                        value={settings.longBreakDuration}
                        onChange={(e) => setSettings({ ...settings, longBreakDuration: Number(e.target.value) })}
                        className="w-full bg-white/10 rounded px-3 py-2 text-white"
                        min="1"
                        max="60"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Alarm Sound</Label>
                      <Select
                        value={settings.alarmSound}
                        onValueChange={(value) => {
                          setSettings({ ...settings, alarmSound: value });
                          // Stop any playing sound when changing the alarm
                          if (audioRef.current && isPlaying) {
                            audioRef.current.pause();
                            audioRef.current.currentTime = 0;
                            setIsPlaying(false);
                          }
                        }}
                      >
                        <SelectTrigger className="bg-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 text-white border-white/10">
                          {ALARM_SOUNDS.map((sound) => (
                            <SelectItem key={sound.value} value={sound.value}>
                              {sound.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        onClick={previewSound}
                        className="w-full mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-white transition-colors flex items-center justify-center"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <Label>Volume</Label>
                      <Slider
                        value={[settings.volume * 100]}
                        onValueChange={([value]) => setSettings({ ...settings, volume: value / 100 })}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Pomodoro;
