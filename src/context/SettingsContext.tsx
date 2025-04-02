
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

interface UserProfile {
  id: string;
  email: string | undefined;
  isPremium: boolean;
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
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  toggleSyncEnabled: () => void;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const isLoggedIn = !!session;
      setIsAuthenticated(isLoggedIn);
      
      if (isLoggedIn && session?.user) {
        setUserProfile({
          id: session.user.id,
          email: session.user.email,
          isPremium: false // Default to non-premium
        });
      }
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isLoggedIn = !!session;
      setIsAuthenticated(isLoggedIn);
      
      if (isLoggedIn && session?.user) {
        setUserProfile({
          id: session.user.id,
          email: session.user.email,
          isPremium: false // Default to non-premium
        });
      } else {
        setUserProfile(null);
        if (event === 'SIGNED_OUT') {
          setSyncState({
            enabled: false,
            lastSynced: null
          });
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleSyncEnabled = () => {
    if (!userProfile?.isPremium && !syncState.enabled) {
      toast({
        title: "Premium Feature",
        description: "Cloud sync is a premium feature. Please upgrade to enable.",
        variant: "destructive"
      });
      return;
    }

    if (syncState.enabled) {
      setSyncState({
        ...syncState,
        enabled: false
      });
      toast({
        title: "Sync Disabled",
        description: "Your data will no longer be synced to the cloud.",
      });
      return;
    }

    if (!syncState.enabled) {
      syncWithCloud().then(() => {
        setSyncState({
          ...syncState,
          enabled: true
        });
      });
    }
  };

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
      setUserProfile(null);
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

  const syncWithCloud = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to sync your data with the cloud.",
        variant: "destructive"
      });
      return;
    }

    if (!userProfile?.isPremium) {
      toast({
        title: "Premium Feature",
        description: "Cloud sync is a premium feature. Please upgrade to enable.",
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
      
      await syncNotes(user.id);
      await syncTodos(user.id);
      await syncEvents(user.id);
      await syncPomodoroSettings(user.id);
      
      setSyncState({
        ...syncState,
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

  const syncOnBlur = async (elementType: string) => {
    if (isAuthenticated && userProfile?.isPremium && syncState.enabled) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        if (elementType === 'notes') {
          await syncNotes(user.id);
        } else if (elementType === 'todos') {
          await syncTodos(user.id);
        } else if (elementType === 'events') {
          await syncEvents(user.id);
        }
        
        setSyncState({
          ...syncState,
          lastSynced: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Auto-sync error:", error);
      }
    }
  };

  const syncNotes = async (userId: string) => {
    let localNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    if (!Array.isArray(localNotes) || localNotes.length === 0) {
      localNotes = [];
    }
    
    const { data: cloudNotes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    if (!cloudNotes || cloudNotes.length === 0) {
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
      
      const notesToUpload = [];
      const mergedNotes = [];
      
      localNotes.forEach((note: any) => {
        const cloudNote = cloudNotesMap.get(note.id);
        
        if (!cloudNote) {
          notesToUpload.push({
            id: note.id,
            user_id: userId,
            content: note.content,
            created_at: new Date(note.createdAt).toISOString(),
            updated_at: new Date(note.updatedAt).toISOString()
          });
          mergedNotes.push(note);
        } else {
          if (note.updatedAt > cloudNote.updatedAt) {
            notesToUpload.push({
              id: note.id,
              user_id: userId,
              content: note.content,
              updated_at: new Date(note.updatedAt).toISOString()
            });
            mergedNotes.push(note);
          } else {
            mergedNotes.push({
              id: cloudNote.id,
              content: cloudNote.content,
              createdAt: note.createdAt,
              updatedAt: cloudNote.updatedAt
            });
          }
        }
      });
      
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
      
      if (notesToUpload.length > 0) {
        const { error } = await supabase
          .from('notes')
          .upsert(notesToUpload);
        if (error) throw error;
      }
      
      localStorage.setItem('notes', JSON.stringify(mergedNotes));
    }
  };

  const syncTodos = async (userId: string) => {
    let localTodos = JSON.parse(localStorage.getItem('todos') || '[]');
    if (!Array.isArray(localTodos) || localTodos.length === 0) {
      localTodos = [];
    }
    
    const { data: cloudTodos, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    if (!cloudTodos || cloudTodos.length === 0) {
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
      
      const todosToUpload = [];
      const mergedTodos = [];
      
      localTodos.forEach((todo: any) => {
        const cloudTodo = cloudTodosMap.get(todo.id);
        
        if (!cloudTodo) {
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
      
      if (todosToUpload.length > 0) {
        const { error } = await supabase
          .from('todos')
          .upsert(todosToUpload);
        if (error) throw error;
      }
      
      localStorage.setItem('todos', JSON.stringify(mergedTodos));
    }
  };

  const syncEvents = async (userId: string) => {
    let localEvents = JSON.parse(localStorage.getItem('dashboard-events') || '[]');
    if (!Array.isArray(localEvents) || localEvents.length === 0) {
      localEvents = [];
    }
    
    const { data: cloudEvents, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    if (!cloudEvents || cloudEvents.length === 0) {
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
      
      const eventsToUpload = [];
      const mergedEvents = [];
      
      localEvents.forEach((event: any) => {
        if (!cloudEventsMap.has(event.id)) {
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
      
      if (eventsToUpload.length > 0) {
        const { error } = await supabase
          .from('events')
          .upsert(eventsToUpload);
        if (error) throw error;
      }
      
      localStorage.setItem('dashboard-events', JSON.stringify(mergedEvents));
    }
  };

  const syncPomodoroSettings = async (userId: string) => {
    const localSessions = parseInt(localStorage.getItem('pomodoro-sessions') || '0');
    
    const { data: cloudSettings, error } = await supabase
      .from('pomodoro_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!cloudSettings) {
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
      const sessionCount = Math.max(localSessions, cloudSettings.sessions);
      
      if (localSessions > cloudSettings.sessions) {
        const { error } = await supabase
          .from('pomodoro_settings')
          .update({ sessions: localSessions })
          .eq('id', cloudSettings.id);
          
        if (error) throw error;
      } else if (cloudSettings.sessions > localSessions) {
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
        isLoading,
        userProfile,
        setUserProfile,
        toggleSyncEnabled
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
