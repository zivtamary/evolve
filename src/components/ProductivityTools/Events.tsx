import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CalendarDays, Calendar as CalendarIcon, Clock, X, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from '@/context/ThemeContext';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
}

const Events = () => {
  const { theme } = useTheme();
  const [events, setEvents] = useLocalStorage<Event[]>('dashboard-events', []);
  const [activeTab, setActiveTab] = useState("today");
  const [dialogState, setDialogState] = useState<'closed' | 'create' | 'edit'>('closed');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    description: ''
  });
  
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
  
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time || '',
      description: event.description || ''
    });
    setDialogState('edit');
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const saveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...event, ...newEvent }
          : event
      ));
    } else {
      // Create new event
      const event: Event = {
        id: Date.now().toString(),
        ...newEvent
      };
      setEvents([...events, event]);
    }
    resetForm();
  };
  
  const resetForm = () => {
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      description: ''
    });
    setEditingEvent(null);
    setDialogState('closed');
  };
  
  return (
    <div className="glass dark:glass-dark rounded-xl text-white overflow-hidden h-[400px] flex flex-col relative">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          <span>Events</span>
        </h2>
        <button
          onClick={() => setDialogState('create')}
          className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
          title="New event"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </button>
      </div>

      <Dialog open={dialogState !== 'closed'} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="border-white/10">
          <DialogHeader>
            <DialogTitle>
              {dialogState === 'edit' ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEvent} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full bg-black/10 dark:bg-black/20 px-4 py-2 rounded outline-none border border-black/10 dark:border-white/10 focus:border-black/30 dark:focus:border-white/30"
                placeholder="Event title"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between px-4 py-2 rounded border bg-black/10 dark:bg-black/20 border-black/10 dark:border-white/10 focus:border-black/30 dark:focus:border-white/30 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  >
                    {format(new Date(newEvent.date), 'PPP')}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(newEvent.date)}
                    onSelect={(date) => date && setNewEvent({ ...newEvent, date: date.toISOString().split('T')[0] })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm mb-1">Time (optional)</label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="w-full bg-black/10 dark:bg-black/20 px-4 py-2 rounded outline-none border border-black/10 dark:border-white/10 focus:border-black/30 dark:focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Description (optional)</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full bg-black/10 dark:bg-black/20 px-4 py-2 rounded outline-none border border-black/10 dark:border-white/10 focus:border-black/30 dark:focus:border-white/30 resize-none h-20"
                placeholder="Event description"
              />
            </div>
            <DialogFooter>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-black/20 dark:bg-white/20 hover:bg-black/30 dark:hover:bg-white/30 rounded transition-colors"
                >
                  {dialogState === 'edit' ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="p-4 flex-1 overflow-hidden">
        <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-3 mb-4 bg-black/20">
            <TabsTrigger 
              value="today" 
              className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20"
            >
              Today
            </TabsTrigger>
            <TabsTrigger 
              value="week" 
              className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20"
            >
              This Week
            </TabsTrigger>
            <TabsTrigger 
              value="month" 
              className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20"
            >
              This Month
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0 flex-1 overflow-hidden">
            {filteredEvents.length > 0 ? (
              <div className="space-y-3 h-full overflow-y-auto pr-1">
                {filteredEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="p-3 rounded-md bg-black/20 hover:bg-black/30 border border-white/10 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-white">{event.title}</div>
                        <div className="flex items-center justify-between text-sm text-white/70 mt-1">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
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
                          <div className="text-sm mt-1 text-white/70 line-clamp-2">{event.description}</div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-md transition-all">
                          <MoreVertical className="h-4 w-4 text-white/70" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-black/95 border border-white/10">
                          <DropdownMenuItem 
                            onClick={() => handleEditEvent(event)}
                            className="flex items-center gap-2 text-white hover:bg-white/10 cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteEvent(event.id)}
                            className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-white/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-white/50">
                No events scheduled for this period
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Events;
