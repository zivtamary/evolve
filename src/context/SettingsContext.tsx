
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';

interface WidgetVisibility {
  notes: boolean;
  todoList: boolean;
  pomodoro: boolean;
  events: boolean;
}

interface SyncState {
  enabled: boolean;
  lastSynced: string | null;
}

interface SettingsContextType {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (value: boolean) => void;
  widgetVisibility: WidgetVisibility;
  toggleWidget: (widget: keyof WidgetVisibility) => void;
  syncState: SyncState;
  setSyncState: (value: SyncState) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  syncWithCloud: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const defaultWidgetVisibility: WidgetVisibility = {
  notes: true,
  todoList: true,
  pomodoro: false,
  events: true,
};

const defaultSyncState: SyncState = {
  enabled: false,
  lastSynced: null,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [widgetVisibility, setWidgetVisibility] = useLocalStorage<WidgetVisibility>(
    'widget-visibility',
    defaultWidgetVisibility
  );
  const [syncState, setSyncState] = useLocalStorage<SyncState>('sync-state', defaultSyncState);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleWidget = (widget: keyof WidgetVisibility) => {
    setWidgetVisibility({
      ...widgetVisibility,
      [widget]: !widgetVisibility[widget],
    });
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setSyncState({
        enabled: false,
        lastSynced: null,
      });
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // This is the main sync implementation
  const syncWithCloud = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to sync your data with the cloud.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not found");
      }
      
      // Sync notes
      await syncNotes(user.id);
      
      // Sync todos
      await syncTodos(user.id);
      
      // Sync events
      await syncEvents(user.id);
      
      // Sync pomodoro settings
      await syncPomodoroSettings(user.id);
      
      // Update lastSynced timestamp
      setSyncState({
        ...syncState,
        enabled: true,
        lastSynced: new Date().toISOString(),
      });
      
      toast({
        title: "Sync complete",
        description: "Your data has been synchronized with the cloud.",
      });
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message || "An error occurred during synchronization",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to sync notes
  const syncNotes = async (userId: string) => {
    // Get local notes
    let localNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    if (!Array.isArray(localNotes) || localNotes.length === 0) {
      localNotes = [];
    }
    
    // Get cloud notes
    const { data: cloudNotes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    if (!cloudNotes || cloudNotes.length === 0) {
      // No cloud notes, push local notes to cloud
      if (localNotes.length > 0) {
        const notesToUpload = localNotes.map((note: any) => ({
          id: note.id,
          user_id: userId,
          content: note.content,
          created_at: new Date(note.createdAt).toISOString(),
          updated_at: new Date(note.updatedAt).toISOString()
        }));
        
        const { error } = await supabase
          .from('notes')
          .upsert(notesToUpload);
        if (error) throw error;
      }
    } else {
      // Merge local and cloud notes
      // Create a map of notes by id
      const localNotesMap = new Map();
      localNotes.forEach((note: any) => {
        const localData = {
          id: note.id,
          content: note.content,
          updatedAt: note.updatedAt
        };
        localNotesMap.set(note.id, localData);
      });
      
      const cloudNotesMap = new Map();
      cloudNotes.forEach((note: any) => {
        const cloudData = {
          id: note.id,
          content: note.content,
          updatedAt: new Date(note.updated_at).getTime()
        };
        cloudNotesMap.set(note.id, cloudData);
      });
      
      // Notes to update in cloud
      const notesToUpload = [];
      
      // New merged notes to save locally
      const mergedNotes = [];
      
      // Process local notes
      localNotes.forEach((note: any) => {
        const cloudNote = cloudNotesMap.get(note.id);
        
        if (!cloudNote) {
          // Note exists only locally, upload to cloud
          notesToUpload.push({
            id: note.id,
            user_id: userId,
            content: note.content,
            created_at: new Date(note.createdAt).toISOString(),
            updated_at: new Date(note.updatedAt).toISOString()
          });
          mergedNotes.push(note);
        } else {
          // Note exists in both places, compare timestamps
          if (note.updatedAt > cloudNote.updatedAt) {
            // Local note is newer, update cloud
            notesToUpload.push({
              id: note.id,
              user_id: userId,
              content: note.content,
              updated_at: new Date(note.updatedAt).toISOString()
            });
            mergedNotes.push(note);
          } else {
            // Cloud note is newer or same, use cloud version
            mergedNotes.push({
              id: cloudNote.id,
              content: cloudNote.content,
              createdAt: note.createdAt, // Keep original creation time
              updatedAt: cloudNote.updatedAt
            });
          }
        }
      });
      
      // Add cloud-only notes to merged notes
      cloudNotes.forEach((note: any) => {
        if (!localNotesMap.has(note.id)) {
          mergedNotes.push({
            id: note.id,
            content: note.content,
            createdAt: new Date(note.created_at).getTime(),
            updatedAt: new Date(note.updated_at).getTime()
          });
        }
      });
      
      // Upload notes to cloud
      if (notesToUpload.length > 0) {
        const { error } = await supabase
          .from('notes')
          .upsert(notesToUpload);
        if (error) throw error;
      }
      
      // Save merged notes locally
      localStorage.setItem('notes', JSON.stringify(mergedNotes));
    }
  };

  // Helper function to sync todos
  const syncTodos = async (userId: string) => {
    // Get local todos
    let localTodos = JSON.parse(localStorage.getItem('todos') || '[]');
    if (!Array.isArray(localTodos) || localTodos.length === 0) {
      localTodos = [];
    }
    
    // Get cloud todos
    const { data: cloudTodos, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    if (!cloudTodos || cloudTodos.length === 0) {
      // No cloud todos, push local todos to cloud
      if (localTodos.length > 0) {
        const todosToUpload = localTodos.map((todo: any) => ({
          id: todo.id,
          user_id: userId,
          title: todo.text,
          completed: todo.completed,
          created_at: new Date(todo.createdAt).toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { error } = await supabase
          .from('todos')
          .upsert(todosToUpload);
        if (error) throw error;
      }
    } else {
      // Merge local and cloud todos
      // Create a map of todos by id
      const localTodosMap = new Map();
      localTodos.forEach((todo: any) => {
        localTodosMap.set(todo.id, todo);
      });
      
      const cloudTodosMap = new Map();
      cloudTodos.forEach((todo: any) => {
        cloudTodosMap.set(todo.id, {
          id: todo.id,
          text: todo.title,
          completed: todo.completed,
          createdAt: new Date(todo.created_at).getTime(),
          updatedAt: new Date(todo.updated_at).getTime()
        });
      });
      
      // Todos to update in cloud
      const todosToUpload = [];
      
      // New merged todos to save locally
      const mergedTodos = [];
      
      // Process local todos
      localTodos.forEach((todo: any) => {
        const cloudTodo = cloudTodosMap.get(todo.id);
        
        if (!cloudTodo) {
          // Todo exists only locally, upload to cloud
          todosToUpload.push({
            id: todo.id,
            user_id: userId,
            title: todo.text,
            completed: todo.completed,
            created_at: new Date(todo.createdAt).toISOString(),
            updated_at: new Date().toISOString()
          });
          mergedTodos.push(todo);
        } else {
          // Use the most recent version (assume local is more up-to-date)
          mergedTodos.push(todo);
          todosToUpload.push({
            id: todo.id,
            user_id: userId,
            title: todo.text,
            completed: todo.completed,
            updated_at: new Date().toISOString()
          });
        }
      });
      
      // Add cloud-only todos to merged todos
      cloudTodos.forEach((todo: any) => {
        if (!localTodosMap.has(todo.id)) {
          mergedTodos.push({
            id: todo.id,
            text: todo.title,
            completed: todo.completed,
            createdAt: new Date(todo.created_at).getTime()
          });
        }
      });
      
      // Upload todos to cloud
      if (todosToUpload.length > 0) {
        const { error } = await supabase
          .from('todos')
          .upsert(todosToUpload);
        if (error) throw error;
      }
      
      // Save merged todos locally
      localStorage.setItem('todos', JSON.stringify(mergedTodos));
    }
  };

  // Helper function to sync events
  const syncEvents = async (userId: string) => {
    // Get local events
    let localEvents = JSON.parse(localStorage.getItem('dashboard-events') || '[]');
    if (!Array.isArray(localEvents) || localEvents.length === 0) {
      localEvents = [];
    }
    
    // Get cloud events
    const { data: cloudEvents, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    if (!cloudEvents || cloudEvents.length === 0) {
      // No cloud events, push local events to cloud
      if (localEvents.length > 0) {
        const eventsToUpload = localEvents.map((event: any) => ({
          id: event.id,
          user_id: userId,
          title: event.title,
          date: event.date,
          time: event.time || null,
          description: event.description || null
        }));
        
        const { error } = await supabase
          .from('events')
          .upsert(eventsToUpload);
        if (error) throw error;
      }
    } else {
      // Merge local and cloud events (similar to notes and todos)
      const localEventsMap = new Map();
      localEvents.forEach((event: any) => {
        localEventsMap.set(event.id, event);
      });
      
      const cloudEventsMap = new Map();
      cloudEvents.forEach((event: any) => {
        cloudEventsMap.set(event.id, {
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          description: event.description
        });
      });
      
      // Events to update in cloud
      const eventsToUpload = [];
      
      // New merged events to save locally
      const mergedEvents = [];
      
      // Process local events (assume local is authoritative)
      localEvents.forEach((event: any) => {
        if (!cloudEventsMap.has(event.id)) {
          // Event exists only locally, upload to cloud
          eventsToUpload.push({
            id: event.id,
            user_id: userId,
            title: event.title,
            date: event.date,
            time: event.time || null,
            description: event.description || null
          });
        }
        mergedEvents.push(event);
      });
      
      // Add cloud-only events to merged events
      cloudEvents.forEach((event: any) => {
        if (!localEventsMap.has(event.id)) {
          mergedEvents.push({
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            description: event.description
          });
        }
      });
      
      // Upload events to cloud
      if (eventsToUpload.length > 0) {
        const { error } = await supabase
          .from('events')
          .upsert(eventsToUpload);
        if (error) throw error;
      }
      
      // Save merged events locally
      localStorage.setItem('dashboard-events', JSON.stringify(mergedEvents));
    }
  };

  // Helper function to sync pomodoro settings
  const syncPomodoroSettings = async (userId: string) => {
    // Get local pomodoro sessions
    const localSessions = parseInt(localStorage.getItem('pomodoro-sessions') || '0');
    
    // Get cloud pomodoro settings
    const { data: cloudSettings, error } = await supabase
      .from('pomodoro_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!cloudSettings) {
      // No cloud settings, create new record
      const { error } = await supabase
        .from('pomodoro_settings')
        .insert([
          {
            user_id: userId,
            sessions: localSessions
          }
        ]);
        
      if (error) throw error;
    } else {
      // Use the higher session count
      const sessionCount = Math.max(localSessions, cloudSettings.sessions);
      
      // Update cloud if local is higher
      if (localSessions > cloudSettings.sessions) {
        const { error } = await supabase
          .from('pomodoro_settings')
          .update({ sessions: localSessions })
          .eq('id', cloudSettings.id);
          
        if (error) throw error;
      } else if (cloudSettings.sessions > localSessions) {
        // Update local if cloud is higher
        localStorage.setItem('pomodoro-sessions', cloudSettings.sessions.toString());
      }
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        isSettingsOpen,
        setIsSettingsOpen,
        widgetVisibility,
        toggleWidget,
        syncState,
        setSyncState,
        isAuthenticated,
        setIsAuthenticated,
        syncWithCloud,
        signOut,
        isLoading
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
