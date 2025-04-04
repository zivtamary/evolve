import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface WidgetVisibility {
  notes: boolean;
  todoList: boolean;
  pomodoro: boolean;
  events: boolean;
}

interface Note {
  id: string;
  content: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface CloudNote {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Todo {
  id: string;
  text: string;
  title?: string;
  completed?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: number;
}

interface StoredData<T> {
  value: T;
  timestamp: number;
}

interface CloudTodo {
  id: string;
  title: string;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface CloudEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface SettingsContextType {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (value: boolean) => void;
  widgetVisibility: WidgetVisibility;
  toggleWidget: (widget: keyof WidgetVisibility) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  syncWithCloud: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
  userProfile: Profile | null;
  setUserProfile: (profile: Profile | null) => void;
  toggleSyncEnabled: () => void;
  subscription: Subscription | null;
  setSubscription: (subscription: Subscription | null) => void;
  syncNotesOnBlur: () => Promise<void>;
  syncTodosOnBlur: () => Promise<void>;
  syncEventsOnBlur: () => Promise<void>;
  syncPomodoroOnBlur: () => Promise<void>;
}

const defaultWidgetVisibility: WidgetVisibility = {
  notes: true,
  todoList: true,
  pomodoro: false,
  events: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>({
    id: 'local',
    widget_visibility: defaultWidgetVisibility,
    cloud_sync_enabled: false,
    last_synced: null
  } as Profile);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const isAuthenticatedRef = useRef(isAuthenticated);
  const isCheckingSessionRef = useRef(false);

  // Update ref when state changes
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    const checkSession = async () => {
      // If we're already checking the session, don't start another check
      if (isCheckingSessionRef.current) {
        console.log('[SettingsContext] Session check already in progress, skipping');
        return;
      }

      try {
        isCheckingSessionRef.current = true;
        console.log('[SettingsContext] Starting session check...');
        
        // 1. Get session and user
        console.log('[SettingsContext] Getting session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('[SettingsContext] Session check result:', { session: !!session, error: sessionError });
        
        console.log('[SettingsContext] Getting user...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('[SettingsContext] User check result:', { user: !!user, error: userError });
        
        if (sessionError || userError) {
          console.error('[SettingsContext] Session or user error:', sessionError || userError);
          setIsAuthenticated(false);
          setUserProfile(null);
          setSubscription(null);
          setIsLoading(false);
          return;
        }
        
        console.log('[SettingsContext] Session state:', {
          exists: !!session,
          user: user?.id,
          expiresAt: session?.expires_at
        });

        // Set initial state based on session and user
        const hasValidSession = !!session && !!user;
        console.log('[SettingsContext] Setting auth state:', hasValidSession);
        setIsAuthenticated(hasValidSession);
        
        // If no valid session, clear state and return early
        if (!hasValidSession) {
          console.log('[SettingsContext] No valid session, clearing state');
          setUserProfile(null);
          setSubscription(null);
          setIsLoading(false);
          return;
        }

        try {
          // 3. Fetch profile
          console.log('[SettingsContext] Fetching profile for user:', user.id);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          console.log('[SettingsContext] Profile fetch result:', { data: !!profileData, error: profileError });

          if (profileError) {
            console.error('[SettingsContext] Profile error:', profileError);
            if (profileError.code === 'PGRST116') {
              console.log('[SettingsContext] Profile not found, creating new profile');
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([{ 
                  id: user.id,
                  widget_visibility: {
                    notes: true,
                    todoList: true,
                    pomodoro: true,
                    events: true
                  },
                  cloud_sync_enabled: false,
                  last_synced: null
                }])
                .select()
                .single();

              if (createError) {
                console.error('[SettingsContext] Error creating profile:', createError);
                throw createError;
              }
              console.log('[SettingsContext] New profile created:', newProfile);
              setUserProfile(newProfile);
            } else {
              throw profileError;
            }
          } else {
            console.log('[SettingsContext] Existing profile found:', profileData);
            setUserProfile(profileData);
          }

          // 4. Fetch subscription
          console.log('[SettingsContext] Fetching subscription');
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          console.log('[SettingsContext] Subscription fetch result:', { data: !!subscriptionData, error: subscriptionError });

          if (subscriptionError) {
            console.error('[SettingsContext] Error fetching subscription:', subscriptionError);
            // Don't throw error, just log it
          } else {
            console.log('[SettingsContext] Subscription state:', subscriptionData);
            setSubscription(subscriptionData);
          }
        } catch (error) {
          console.error('[SettingsContext] Error in data fetching:', error);
          // Don't reset auth state on profile/subscription errors
          toast({
            title: "Error",
            description: "Error loading user data",
            variant: "destructive"
          });
        } finally {
          console.log('[SettingsContext] Setting isLoading to false');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[SettingsContext] Error in session check:', error);
        setIsAuthenticated(false);
        setUserProfile(null);
        setSubscription(null);
        setIsLoading(false);
        toast({
          title: "Session Error",
          description: "Please try logging in again",
          variant: "destructive"
        });
      } finally {
        isCheckingSessionRef.current = false;
      }
    };

    // Initial check
    console.log('[SettingsContext] Starting initial session check');
    checkSession().catch(error => {
      console.error('[SettingsContext] Unhandled error in initial check:', error);
      setIsLoading(false);
      isCheckingSessionRef.current = false;
    });

    // Set up auth state change listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[SettingsContext] Auth state changed:', { event, sessionExists: !!session });
        
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUserProfile(null);
          setSubscription(null);
          setIsLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Only set authenticated state if we're not already authenticated
          if (!isAuthenticatedRef.current) {
            setIsAuthenticated(true);
            // Then fetch additional data
            await checkSession();
          }
        }
      }
    );

    // Cleanup
    return () => {
      console.log('[SettingsContext] Cleaning up...');
      authSubscription.unsubscribe();
    };
  }, []);

  const toggleWidget = async (widget: keyof WidgetVisibility) => {
    try {
      const currentVisibility = userProfile?.widget_visibility || defaultWidgetVisibility;
      const newVisibility = {
        ...currentVisibility,
        [widget]: !currentVisibility[widget]
      };
      
      if (isAuthenticated && userProfile) {
        // Update cloud profile if authenticated
        const { error } = await supabase
          .from('profiles')
          .update({ widget_visibility: newVisibility })
          .eq('id', userProfile.id);
          
        if (error) throw error;
        
        setUserProfile({
          ...userProfile,
          widget_visibility: newVisibility
        });
      } else {
        // Save to localStorage if not authenticated
        localStorage.setItem('widget_visibility', JSON.stringify(newVisibility));
        setUserProfile({
          id: 'local',
          widget_visibility: newVisibility,
          cloud_sync_enabled: false,
          last_synced: null
        } as Profile);
      }
    } catch (error) {
      console.error('Error toggling widget:', error);
      toast({
        title: "Error",
        description: "Failed to update widget visibility",
        variant: "destructive"
      });
    }
  };

  // Load local widget visibility on mount
  useEffect(() => {
    if (!isAuthenticated) {
      const localVisibility = localStorage.getItem('widget_visibility');
      if (localVisibility) {
        try {
          const parsedVisibility = JSON.parse(localVisibility);
          setUserProfile({
            id: 'local',
            widget_visibility: parsedVisibility,
            cloud_sync_enabled: false,
            last_synced: null
          } as Profile);
        } catch (error) {
          console.error('Error parsing local widget visibility:', error);
        }
      }
    }
  }, [isAuthenticated]);

  const toggleSyncEnabled = async () => {
    if (!userProfile) return;
    
    if (!isAuthenticated || subscription?.status !== 'active') {
      toast({
        title: "Premium Feature",
        description: "Cloud sync is a premium feature. Please upgrade to enable.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSyncing(true);
      const newSyncEnabled = !userProfile.cloud_sync_enabled;
      
      const { error } = await supabase
        .from('profiles')
        .update({ cloud_sync_enabled: newSyncEnabled })
        .eq('id', userProfile.id);
        
      if (error) throw error;
      
      setUserProfile({
        ...userProfile,
        cloud_sync_enabled: newSyncEnabled
      });
      
      if (newSyncEnabled) {
        await syncWithCloud();
      }
    } catch (error) {
      console.error('Error toggling sync:', error);
      toast({
        title: "Error",
        description: "Failed to update sync settings",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserProfile(null);
      setSubscription(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add specific sync triggers
  const syncNotesOnBlur = async () => {
    if (!isAuthenticated || !userProfile?.cloud_sync_enabled) {
      console.log('Sync skipped - not authenticated or cloud sync disabled');
      return;
    }
    try {
      console.log('Starting notes sync...');
      await syncNotes(userProfile.id);
      console.log('Notes sync completed successfully');
    } catch (error) {
      console.error('Error in syncNotesOnBlur:', error);
    }
  };

  const syncTodosOnBlur = async () => {
    if (!isAuthenticated || !userProfile?.cloud_sync_enabled) {
      console.log('Sync skipped - not authenticated or cloud sync disabled');
      return;
    }
    try {
      console.log('Starting todos sync...');
      await syncTodos(userProfile.id);
      console.log('Todos sync completed successfully');
    } catch (error) {
      console.error('Error in syncTodosOnBlur:', error);
    }
  };

  const syncEventsOnBlur = async () => {
    if (!isAuthenticated || !userProfile?.cloud_sync_enabled) {
      console.log('Sync skipped - not authenticated or cloud sync disabled');
      return;
    }
    try {
      console.log('Starting events sync...');
      await syncEvents(userProfile.id);
      console.log('Events sync completed successfully');
    } catch (error) {
      console.error('Error in syncEventsOnBlur:', error);
    }
  };

  const syncPomodoroOnBlur = async () => {
    if (!isAuthenticated || !userProfile?.cloud_sync_enabled) {
      console.log('Sync skipped - not authenticated or cloud sync disabled');
      return;
    }
    try {
      console.log('Starting pomodoro settings sync...');
      await syncPomodoroSettings(userProfile.id);
      console.log('Pomodoro settings sync completed successfully');
    } catch (error) {
      console.error('Error in syncPomodoroOnBlur:', error);
    }
  };

  const syncWithCloud = async () => {
    if (!isAuthenticated || !userProfile) {
      toast({
        title: "Authentication required",
        description: "Please sign in to sync your data with the cloud.",
        variant: "destructive"
      });
      return;
    }

    if (subscription?.status !== 'active') {
      toast({
        title: "Premium Feature",
        description: "Cloud sync is a premium feature. Please upgrade to enable.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSyncing(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not found");
      }
      
      await syncNotes(user.id);
      await syncTodos(user.id);
      await syncEvents(user.id);
      await syncPomodoroSettings(user.id);
      
      // Update last_synced timestamp
      const { error } = await supabase
        .from('profiles')
        .update({ last_synced: new Date().toISOString() })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setUserProfile(prev => prev ? {
        ...prev,
        last_synced: new Date().toISOString()
      } : null);
      
      toast({
        title: "Sync complete",
        description: "Your data has been synchronized with the cloud.",
      });
    } catch (error) {
      console.error('Error syncing data:', error);
      toast({
        title: "Sync failed",
        description: "An error occurred during synchronization",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncNotes = async (userId: string) => {
    try {
      console.log('Fetching local notes...');
      const localNotesStr = localStorage.getItem('notes');
      const localNotesData = localNotesStr ? JSON.parse(localNotesStr) : null;
      
      // Handle both old format (array) and new format (StoredData)
      const localNotes = localNotesData && typeof localNotesData === 'object' && 'value' in localNotesData
        ? localNotesData.value
        : Array.isArray(localNotesData)
          ? localNotesData
          : [];
          
      console.log('Local notes found:', localNotes.length);
      
      console.log('Fetching cloud notes...');
    const { data: cloudNotes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
      console.log('Cloud notes found:', cloudNotes?.length || 0);
      
      // Merge and sync
      const notesToSync = localNotes.map((note: Note) => ({
            id: note.id,
            user_id: userId,
            content: note.content,
        created_at: note.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      if (notesToSync.length > 0) {
        console.log('Syncing', notesToSync.length, 'notes to cloud...');
        const { error: syncError } = await supabase
          .from('notes')
          .upsert(notesToSync);
          
        if (syncError) throw syncError;
        console.log('Notes synced successfully');
      } else {
        console.log('No notes to sync');
      }
    } catch (error) {
      console.error('Error in syncNotes:', error);
      throw error;
    }
  };

  const syncTodos = async (userId: string) => {
    try {
      console.log('Fetching local todos...');
      const localTodosStr = localStorage.getItem('todos');
      const localTodosData = localTodosStr ? JSON.parse(localTodosStr) : null;
      
      // Handle both old format (array) and new format (StoredData)
      const localTodos = localTodosData && typeof localTodosData === 'object' && 'value' in localTodosData
        ? localTodosData.value
        : Array.isArray(localTodosData)
          ? localTodosData
          : [];
      
      console.log('Local todos found:', localTodos.length);
      
      console.log('Fetching cloud todos...');
      const { data: cloudTodos, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      console.log('Cloud todos found:', cloudTodos?.length || 0);

      // Create sets of IDs for comparison
      const localTodoIds = new Set(localTodos.map(todo => todo.id));
      const cloudTodoIds = new Set(cloudTodos?.map(todo => todo.id) || []);

      // Find todos to delete (in cloud but not in local)
      const todosToDelete = Array.from(cloudTodoIds).filter(id => !localTodoIds.has(id));
      
      if (todosToDelete.length > 0) {
        console.log('Deleting', todosToDelete.length, 'todos from cloud...');
        const { error: deleteError } = await supabase
          .from('todos')
          .delete()
          .in('id', todosToDelete);
          
        if (deleteError) throw deleteError;
        console.log('Todos deleted successfully');
      }

      // Merge cloud and local todos
      const mergedTodos = new Map<string, Todo>();
      
      // Add cloud todos first
      if (cloudTodos) {
        cloudTodos.forEach((todo: CloudTodo) => {
          mergedTodos.set(todo.id, {
            id: todo.id,
            text: todo.title,
            completed: todo.completed,
            createdAt: new Date(todo.created_at).getTime()
          });
        });
      }
      
      // Add local todos, keeping the most recent version if there's a conflict
      localTodos.forEach(todo => {
        const existingTodo = mergedTodos.get(todo.id);
        if (!existingTodo || (todo.createdAt && todo.createdAt > (existingTodo.createdAt || 0))) {
          mergedTodos.set(todo.id, todo);
        }
      });
      
      // Convert back to array and sort by creation date
      const finalTodos = Array.from(mergedTodos.values()).sort((a, b) => 
        (b.createdAt || 0) - (a.createdAt || 0)
      );
      
      // Update localStorage with merged data
      const storedData: StoredData<Todo[]> = {
        value: finalTodos,
        timestamp: Date.now()
      };
      localStorage.setItem('todos', JSON.stringify(storedData));
      
      // Sync merged data back to cloud
      const todosToSync = finalTodos.map(todo => {
        const now = new Date().toISOString();
        return {
          id: todo.id,
          user_id: userId,
          title: todo.text,
          completed: todo.completed || false,
          created_at: now,
          updated_at: now
        };
      });
      
      if (todosToSync.length > 0) {
        console.log('Syncing', todosToSync.length, 'todos to cloud...');
        const { error: syncError } = await supabase
          .from('todos')
          .upsert(todosToSync);
          
        if (syncError) throw syncError;
        console.log('Todos synced successfully');
      } else {
        console.log('No todos to sync');
      }
    } catch (error) {
      console.error('Error in syncTodos:', error);
      throw error;
    }
  };

  const syncEvents = async (userId: string) => {
    try {
      console.log('Fetching local events...');
      const localEventsStr = localStorage.getItem('dashboard-events');
      const localEventsData = localEventsStr ? JSON.parse(localEventsStr) : null;
      
      // Handle both old format (array) and new format (StoredData)
      const localEvents = localEventsData && typeof localEventsData === 'object' && 'value' in localEventsData
        ? localEventsData.value
        : Array.isArray(localEventsData)
          ? localEventsData
          : [];
      
      console.log('Local events found:', localEvents.length);
      
      console.log('Fetching cloud events...');
    const { data: cloudEvents, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
      console.log('Cloud events found:', cloudEvents?.length || 0);
      
      // Merge and sync
      const eventsToSync = localEvents.map((event: Event) => ({
            id: event.id,
            user_id: userId,
            title: event.title,
        date: event.start.split('T')[0], // Extract date from start time
        time: event.start.split('T')[1], // Extract time from start time
        description: event.title, // Use title as description
        created_at: event.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      if (eventsToSync.length > 0) {
        console.log('Syncing', eventsToSync.length, 'events to cloud...');
        const { error: syncError } = await supabase
          .from('events')
          .upsert(eventsToSync);
          
        if (syncError) throw syncError;
        console.log('Events synced successfully');
      } else {
        console.log('No events to sync');
      }
    } catch (error) {
      console.error('Error in syncEvents:', error);
      throw error;
    }
  };

  const syncPomodoroSettings = async (userId: string) => {
    try {
      console.log('Fetching local pomodoro settings...');
      const localSettingsStr = localStorage.getItem('pomodoro-settings');
      const localSettingsData = localSettingsStr ? JSON.parse(localSettingsStr) : null;
      
      // Handle both old format (object) and new format (StoredData)
      const localSettings = localSettingsData && typeof localSettingsData === 'object' && 'value' in localSettingsData
        ? localSettingsData.value
        : typeof localSettingsData === 'object' && localSettingsData !== null
          ? localSettingsData
          : {};
      
      if (typeof localSettings !== 'object' || localSettings === null) {
        console.warn('Local pomodoro settings is not an object, resetting to default');
        const defaultSettings = {
          workDuration: 25,
          breakDuration: 5,
          longBreakDuration: 15,
          sessions: 0
        };
        localStorage.setItem('pomodoro-settings', JSON.stringify(defaultSettings));
        return;
      }
      
      console.log('Local pomodoro settings:', localSettings);
      
      console.log('Fetching cloud pomodoro settings...');
    const { data: cloudSettings, error } = await supabase
      .from('pomodoro_settings')
      .select('*')
      .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
      
      console.log('Cloud pomodoro settings:', cloudSettings);
      
      // Merge and sync
      const settingsToSync = {
        user_id: userId,
        work_duration: localSettings.workDuration || 25,
        break_duration: localSettings.breakDuration || 5,
        long_break_duration: localSettings.longBreakDuration || 15,
        sessions: localSettings.sessions || 0,
        updated_at: new Date().toISOString()
      };
      
      console.log('Syncing pomodoro settings to cloud...');
      const { error: syncError } = await supabase
        .from('pomodoro_settings')
        .upsert(settingsToSync);
        
      if (syncError) throw syncError;
      console.log('Pomodoro settings synced successfully');
    } catch (error) {
      console.error('Error in syncPomodoroSettings:', error);
      throw error;
    }
  };

  const value = {
        isSettingsOpen,
        setIsSettingsOpen,
    widgetVisibility: userProfile?.widget_visibility || defaultWidgetVisibility,
        toggleWidget,
        isAuthenticated,
        setIsAuthenticated,
        syncWithCloud,
        signOut,
        isLoading,
    isSyncing,
        userProfile,
        setUserProfile,
    toggleSyncEnabled,
    subscription,
    setSubscription,
    syncNotesOnBlur,
    syncTodosOnBlur,
    syncEventsOnBlur,
    syncPomodoroOnBlur
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
