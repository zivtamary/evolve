import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const TIMER_SETTINGS = {
  work: { minutes: 25, label: 'Focus' },
  shortBreak: { minutes: 5, label: 'Short Break' },
  longBreak: { minutes: 15, label: 'Long Break' },
};

const Pomodoro = () => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(TIMER_SETTINGS[mode].minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useLocalStorage<number>('pomodoro-sessions', 0);
  const intervalRef = useRef<number | null>(null);
  
  // Reset timer when mode changes
  useEffect(() => {
    setTimeLeft(TIMER_SETTINGS[mode].minutes * 60);
    setIsActive(false);
    
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [mode]);
  
  // Handle timer countdown
  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer completed
            setIsActive(false);
            if (mode === 'work') {
              setSessions(prev => prev + 1);
              // After 4 sessions, take a long break
              if ((sessions + 1) % 4 === 0) {
                setMode('longBreak');
              } else {
                setMode('shortBreak');
              }
            } else {
              setMode('work');
            }
            return TIMER_SETTINGS[mode].minutes * 60;
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
  }, [isActive, mode, sessions, setSessions]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(TIMER_SETTINGS[mode].minutes * 60);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="glass dark:glass-dark rounded-xl text-white overflow-hidden h-[400px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Pomodoro</h2>
        </div>
        <div className="text-xs text-white/70">
          Session {sessions + 1}
        </div>
      </div>

      <div className="flex-1 p-4">
        <Tabs defaultValue="work" value={mode} onValueChange={(value) => setMode(value as TimerMode)} className="h-full flex flex-col">
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
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Pomodoro;
