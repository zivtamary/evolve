import React, { useState, useEffect, useRef } from 'react';
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
import { useSettings } from '../../context/SettingsContext';
import { supabase } from '@/integrations/supabase/client';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  createdAt: number;
}

interface NewEvent {
  title: string;
  date: string;
  time: string;
  description: string;
}

interface StoredEvents {
  value: Event[];
  timestamp: number;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const Events = () => {
  const { theme } = useTheme();
  const { syncEventsOnBlur, isAuthenticated, userProfile } = useSettings();
  const [events, setEvents] = useLocalStorage<Event[]>('events', []);
  const [activeTab, setActiveTab] = useState("all");
  const [dialogState, setDialogState] = useState<'closed' | 'create' | 'edit'>('closed');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    description: ''
  });
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Filter events based on active tab
  const getFilteredEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
    
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      if (activeTab === "week") {
        return eventDate >= today && eventDate <= endOfWeek;
      } else if (activeTab === "month") {
        return eventDate >= today && eventDate <= endOfMonth;
      }
      return true; // For "all" tab, return all events
    }).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      dateA.setHours(0, 0, 0, 0);
      dateB.setHours(0, 0, 0, 0);
      
      // If both dates are in the past or both are in the future, sort by date
      if ((dateA < today && dateB < today) || (dateA >= today && dateB >= today)) {
        return dateA.getTime() - dateB.getTime();
      }
      
      // Put future dates before past dates
      return dateB < today ? -1 : 1;
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const getEventCategory = (date: string) => {
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    if (eventDate.getTime() === today.getTime()) {
      return "Today";
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else if (eventDate > today && eventDate <= nextWeek) {
      return "This Week";
    } else if (eventDate > nextWeek) {
      return "Later";
    } else {
      return "Past";
    }
  };

  const filteredEvents = getFilteredEvents();
  
  // Group events by category
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const category = getEventCategory(event.date);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time,
      description: event.description
    });
    setDialogState('edit');
  };

  const handleDeleteEvent = async (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);

    try {
      if (isAuthenticated && userProfile?.cloud_sync_enabled) {
        console.log('Deleting event from Supabase...');
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId)
          .eq('user_id', userProfile.id);

        if (error) throw error;
        console.log('Event deleted from Supabase successfully');
      }
    } catch (error) {
      console.error('Error deleting event from Supabase:', error);
    }
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date) return;

    const event: Event = {
      id: crypto.randomUUID(),
      title: newEvent.title.trim(),
      date: newEvent.date,
      time: newEvent.time || '',
      description: newEvent.description.trim(),
      createdAt: Date.now()
    };

    setEvents([...events, event]);
    setNewEvent({ 
      title: '', 
      date: new Date().toISOString().split('T')[0],
      time: '', 
      description: '' 
    });

    try {
      if (isAuthenticated && userProfile?.cloud_sync_enabled) {
        console.log('Adding event to Supabase...');
        const { error } = await supabase
          .from('events')
          .insert([{
            id: event.id,
            user_id: userProfile.id,
            title: event.title,
            date: event.date,
            time: event.time,
            description: event.description,
            created_at: new Date(event.createdAt).toISOString()
          }]);

        if (error) throw error;
        console.log('Event added to Supabase successfully');
      }
    } catch (error) {
      console.error('Error adding event to Supabase:', error);
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

  const handleEventBlur = async () => {
    try {
      console.log('Event blur event triggered');
      await syncEventsOnBlur();
      console.log('Events sync completed');
    } catch (error) {
      console.error('Error syncing events:', error);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !newEvent.title.trim() || !newEvent.date) return;

    const updatedEvent: Event = {
      ...editingEvent,
      title: newEvent.title.trim(),
      date: newEvent.date,
      time: newEvent.time || '',
      description: newEvent.description.trim()
    };

    const updatedEvents = events.map(event => 
      event.id === editingEvent.id ? updatedEvent : event
    );
    setEvents(updatedEvents);
    resetForm();

    try {
      if (isAuthenticated && userProfile?.cloud_sync_enabled) {
        console.log('Updating event in Supabase...');
        const { error } = await supabase
          .from('events')
          .update({
            title: updatedEvent.title,
            date: updatedEvent.date,
            time: updatedEvent.time,
            description: updatedEvent.description
          })
          .eq('id', updatedEvent.id)
          .eq('user_id', userProfile.id);

        if (error) throw error;
        console.log('Event updated in Supabase successfully');
      }
    } catch (error) {
      console.error('Error updating event in Supabase:', error);
    }
  };

  // Function to fetch events from cloud
  const fetchCloudEvents = async () => {
    if (!isAuthenticated || !userProfile?.cloud_sync_enabled) return;
    
    try {
      console.log('Fetching events from cloud...');
      const { data: cloudEvents, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userProfile.id);
        
      if (error) throw error;
      
      if (cloudEvents) {
        const localEvents = cloudEvents.map(event => ({
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          description: event.description,
          createdAt: new Date(event.created_at).getTime()
        }));
        setEvents(localEvents);
        console.log('Local events updated with cloud data');
      }
    } catch (error) {
      console.error('Error fetching events from cloud:', error);
    }
  };

  // Set up periodic sync
  useEffect(() => {
    if (!isAuthenticated || !userProfile?.cloud_sync_enabled) return;

    // Initial fetch
    fetchCloudEvents();

    // Set up interval for periodic sync (every 30 seconds)
    const intervalId = setInterval(fetchCloudEvents, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [isAuthenticated, userProfile?.cloud_sync_enabled, userProfile?.id]);

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
          <form onSubmit={dialogState === 'edit' ? handleSaveEdit : addEvent} className="space-y-4 mt-4">
            <div className="mb-4">
              <label className="block text-sm mb-1">Title</label>
              <input
                ref={inputRef}
                type="text"
                value={newEvent.title}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= MAX_TITLE_LENGTH) {
                    setNewEvent({ ...newEvent, title: value });
                  }
                }}
                onBlur={handleEventBlur}
                className="w-full bg-black/10 dark:bg-black/20 px-4 py-2 rounded outline-none border border-black/10 dark:border-white/10 focus:border-black/30 dark:focus:border-white/30"
                placeholder="Event title"
                required
              />
              <div className="text-xs text-black/50 dark:text-white/50 mt-1 text-right">
                {newEvent.title.length}/{MAX_TITLE_LENGTH}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full bg-black/10 dark:bg-black/20 px-4 py-2 rounded outline-none border border-black/10 dark:border-white/10 focus:border-black/30 dark:focus:border-white/30 flex items-center justify-between"
                  >
                    {newEvent.date ? format(new Date(newEvent.date), 'PPP') : 'Pick a date'}
                    <CalendarIcon className="h-4 w-4 opacity-70" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newEvent.date ? new Date(newEvent.date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setNewEvent({ ...newEvent, date: date.toISOString().split('T')[0] });
                      }
                    }}
                    initialFocus
                    className="rounded-md border bg-background dark:bg-black/95 dark:border-white/10"
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
                onBlur={handleEventBlur}
                className="w-full bg-black/10 dark:bg-black/20 px-4 py-2 rounded outline-none border border-black/10 dark:border-white/10 focus:border-black/30 dark:focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Description</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= MAX_DESCRIPTION_LENGTH) {
                    setNewEvent({ ...newEvent, description: value });
                  }
                }}
                onBlur={handleEventBlur}
                className="w-full bg-black/10 dark:bg-black/20 px-4 py-2 rounded outline-none border border-black/10 dark:border-white/10 focus:border-black/30 dark:focus:border-white/30"
                placeholder="Event description"
                rows={3}
              />
              <div className="text-xs text-black/50 dark:text-white/50 mt-1 text-right">
                {newEvent.description?.length || 0}/{MAX_DESCRIPTION_LENGTH}
              </div>
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
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-3 mb-4 bg-black/20">
            <TabsTrigger 
              value="all" 
              className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20"
            >
              All
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
              <div className="space-y-4 h-full overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-white/20">
                {Object.entries(groupedEvents).map(([category, events]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-medium text-white/70 px-2">{category}</h3>
                    {events.map((event) => (
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
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{event.time}</span>
                              </div>
                            </div>
                            {event.description && (
                              <div className="text-sm text-white/70 mt-2">
                                {event.description}
                              </div>
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
