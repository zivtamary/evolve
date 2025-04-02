
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
    <Card className="widget bg-card dark:glass-dark backdrop-blur-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Timer className="h-5 w-5" />
          <span>Pomodoro</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="work" value={mode} onValueChange={(value) => setMode(value as TimerMode)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="work">Focus</TabsTrigger>
            <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
            <TabsTrigger value="longBreak">Long Break</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold my-4">
              {formatTime(timeLeft)}
            </div>
            <div className="flex gap-2">
              <Button onClick={toggleTimer} variant="outline" size="sm">
                {isActive ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {isActive ? 'Pause' : 'Start'}
              </Button>
              <Button onClick={resetTimer} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Pomodoro;
