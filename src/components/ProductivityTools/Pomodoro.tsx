import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Timer, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSettings } from '../../context/SettingsContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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
  { 
    value: 'https://fdcqozqhcmrvwzhkprwz.supabase.co/storage/v1/object/sign/evolve/sounds/timer01.wav?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJldm9sdmUvc291bmRzL3RpbWVyMDEud2F2IiwiaWF0IjoxNzQ0NTcyNDY0LCJleHAiOjE3NzYxMDg0NjR9.XRPhAD7WqvfVIiotD7I58PW3fAvo-Rl-rl_-uk-G4s4', 
    label: 'Alarm 1' 
  },
  { 
    value: 'https://fdcqozqhcmrvwzhkprwz.supabase.co/storage/v1/object/sign/evolve/sounds/timer02.mp3?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJldm9sdmUvc291bmRzL3RpbWVyMDIubXAzIiwiaWF0IjoxNzQ0NTcyNDg4LCJleHAiOjE3NzYxMDg0ODh9.kD3gpxG2noJqD0pLFOOgPPpeqKodDDbdPZjCs5tATqE', 
    label: 'Alarm 2' 
  },
  { 
    value: 'https://fdcqozqhcmrvwzhkprwz.supabase.co/storage/v1/object/sign/evolve/sounds/timer03.mp3?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJldm9sdmUvc291bmRzL3RpbWVyMDMubXAzIiwiaWF0IjoxNzQ0NTcyNjc1LCJleHAiOjE3NzYxMDg2NzV9.vZFQ0kQ-9AEjCVUQNQMFokQdXGUVNdIpAgmhSTvGK0M', 
    label: 'Alarm 3' 
  },
];

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessions: 4,
  alarmSound: 'https://fdcqozqhcmrvwzhkprwz.supabase.co/storage/v1/object/sign/evolve/sounds/timer01.wav?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJldm9sdmUvc291bmRzL3RpbWVyMDEud2F2IiwiaWF0IjoxNzQ0NTcyNDY0LCJleHAiOjE3NzYxMDg0NjR9.XRPhAD7WqvfVIiotD7I58PW3fAvo-Rl-rl_-uk-G4s4',
  volume: 0.5
};

const Pomodoro: React.FC = () => {
  const { syncPomodoroOnBlur } = useSettings();
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>('pomodoro-settings', DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempSettings, setTempSettings] = useState<PomodoroSettings>(settings);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(settings.alarmSound);
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
      // console.log('Timer completed, attempting to sync...');
      await syncPomodoroOnBlur();
      // console.log('Pomodoro sync completed');
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
    if (isPlaying) {
      // Stop any currently playing sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    } else {
      // Create a new audio element with the currently selected sound
      const previewAudio = new Audio(tempSettings.alarmSound);
      previewAudio.volume = tempSettings.volume;
      previewAudioRef.current = previewAudio;
      
      // Play the sound
      previewAudio.play();
      setIsPlaying(true);
      
      // Set up event listener for when the sound ends
      previewAudio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
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
    if (!isSettingsOpen && previewAudioRef.current && isPlaying) {
      previewAudioRef.current.pause();
      previewAudioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isSettingsOpen]);

  // Update tempSettings when settings change
  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSaveSettings = () => {
    setSettings(tempSettings);
    setIsSettingsOpen(false);
  };

  const handleCancelSettings = () => {
    setTempSettings(settings);
    setIsSettingsOpen(false);
  };

  const handleResetToDefault = () => {
    setTempSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="glass dark:glass-dark rounded-xl text-white overflow-hidden h-full h-xl:h-[400px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          <h2 className="text-xl font-semibold select-none">Focus Timer</h2>
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
          <TabsList className="grid grid-cols-3 bg-black/20 p-1 gap-1">
            <TabsTrigger 
              value="work" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white hover:text-white hover:bg-white/10 text-white/70"
            >
              Focus
            </TabsTrigger>
            <TabsTrigger 
              value="shortBreak"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white hover:text-white hover:bg-white/10 text-white/70"
            >
              Short Break
            </TabsTrigger>
            <TabsTrigger 
              value="longBreak"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white hover:text-white hover:bg-white/10 text-white/70"
            >
              Long Break
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="select-none text-6xl font-light mb-8 font-['Space_Grotesk']" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.2)' }}>
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
                <DialogContent className="glass dark:glass-dark border-white/10 backdrop-blur-md shadow-xl">
                  <DialogHeader className="border-b border-white/10 pb-3">
                    <DialogTitle className="text-white text-xl font-semibold">Pomodoro Settings</DialogTitle>
                    <p className="text-sm text-white/70">Customize your timer and notification preferences</p>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveSettings();
                  }}>
                    <div className="space-y-8 py-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-white/90">Timer Durations</h3>
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="workDuration" className="text-sm text-white/80">Focus Duration (minutes)</Label>
                            <input
                              id="workDuration"
                              type="number"
                              value={tempSettings.workDuration}
                              onChange={(e) => setTempSettings({ ...tempSettings, workDuration: Number(e.target.value) })}
                              className="w-full bg-white/10 rounded-lg px-3 py-2 text-white border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                              min="1"
                              max="60"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="breakDuration" className="text-sm text-white/80">Short Break Duration (minutes)</Label>
                            <input
                              id="breakDuration"
                              type="number"
                              value={tempSettings.breakDuration}
                              onChange={(e) => setTempSettings({ ...tempSettings, breakDuration: Number(e.target.value) })}
                              className="w-full bg-white/10 rounded-lg px-3 py-2 text-white border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                              min="1"
                              max="30"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="longBreakDuration" className="text-sm text-white/80">Long Break Duration (minutes)</Label>
                            <input
                              id="longBreakDuration"
                              type="number"
                              value={tempSettings.longBreakDuration}
                              onChange={(e) => setTempSettings({ ...tempSettings, longBreakDuration: Number(e.target.value) })}
                              className="w-full bg-white/10 rounded-lg px-3 py-2 text-white border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                              min="1"
                              max="60"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-white/90">Notification Settings</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="alarmSound" className="text-sm text-white/80">Alarm Sound</Label>
                            <Select
                              value={tempSettings.alarmSound}
                              onValueChange={(value) => {
                                setTempSettings({ ...tempSettings, alarmSound: value });
                                if (audioRef.current && isPlaying) {
                                  audioRef.current.pause();
                                  audioRef.current.currentTime = 0;
                                }
                                if (previewAudioRef.current && isPlaying) {
                                  previewAudioRef.current.pause();
                                  previewAudioRef.current.currentTime = 0;
                                }
                                setIsPlaying(false);
                              }}
                            >
                              <SelectTrigger id="alarmSound" className="w-full bg-white/10 text-white border-white/10 focus:border-white/20">
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
                              type="button"
                              onClick={previewSound}
                              className="w-full mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors flex items-center justify-center gap-2 border border-white/10"
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              <span className="text-sm">{isPlaying ? 'Stop' : 'Preview'} Sound</span>
                            </button>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="volume" className="text-sm text-white/80">Volume</Label>
                              <span className="text-sm text-white/60">{Math.round(tempSettings.volume * 100)}%</span>
                            </div>
                            <Slider
                              id="volume"
                              value={[tempSettings.volume * 100]}
                              onValueChange={([value]) => setTempSettings({ ...tempSettings, volume: value / 100 })}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="border-t border-white/10 pt-4">
                      <div className="flex w-full">
                        <div className="flex-1 flex justify-start">
                          <button
                            type="button"
                            onClick={handleResetToDefault}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
                          >
                            Reset
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleCancelSettings}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <Button
                          type="submit"
                          variant="outline" 
                          onClick={handleSaveSettings}
                          className="bg-white/20 px-4 py-2 text-white rounded border-white/10 hover:bg-white/30">
                            Save
                          </Button>
                        </div>
                      </div>
                    </DialogFooter>
                  </form>
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
