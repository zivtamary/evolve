
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CalendarDays, Calendar, Clock } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
}

const Events = () => {
  const [events, setEvents] = useLocalStorage<Event[]>('dashboard-events', []);
  const [activeTab, setActiveTab] = useState("today");
  
  // Example events - in a real app, these would come from an API or user input
  useEffect(() => {
    if (events.length === 0) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 5);
      
      setEvents([
        {
          id: '1',
          title: 'Team Meeting',
          date: today.toISOString().split('T')[0],
          time: '10:00',
          description: 'Weekly team sync'
        },
        {
          id: '2',
          title: 'Project Deadline',
          date: tomorrow.toISOString().split('T')[0],
          time: '18:00',
          description: 'Submit final project draft'
        },
        {
          id: '3',
          title: 'Client Presentation',
          date: nextWeek.toISOString().split('T')[0],
          time: '14:30',
          description: 'Present new designs to client'
        }
      ]);
    }
  }, [events.length, setEvents]);
  
  // Filter events based on active tab
  const getFilteredEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
    
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      if (activeTab === "today") {
        return eventDate >= today && eventDate <= endOfToday;
      } else if (activeTab === "week") {
        return eventDate >= today && eventDate <= endOfWeek;
      } else if (activeTab === "month") {
        return eventDate >= today && eventDate <= endOfMonth;
      }
      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const filteredEvents = getFilteredEvents();
  
  return (
    <Card className="widget bg-card dark:glass-dark backdrop-blur-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5" />
          <span>Events</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {filteredEvents.length > 0 ? (
              <div className="space-y-3 max-h-[12rem] overflow-y-auto pr-1">
                {filteredEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="p-3 rounded-md bg-background/50 dark:bg-white/5 border border-border"
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      {event.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{event.time}</span>
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <div className="text-sm mt-1 line-clamp-2">{event.description}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No events scheduled for this period
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Events;
