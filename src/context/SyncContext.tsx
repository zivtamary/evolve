import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from './SettingsContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'past_due';

interface SyncContextType {
  isSyncing: boolean;
  isEnabled: boolean;
  lastSynced: Date | null;
  subscriptionStatus: SubscriptionStatus | null;
  enableSync: () => void;
  disableSync: () => void;
  validateAndSync: (dataType: DataType) => Promise<void>;
  syncData: () => Promise<void>;
}

type DataType = 'todos' | 'notes' | 'events' | 'pomodoro_settings';

type LocalTodo = {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

type LocalNote = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type LocalEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type LocalPomodoro = {
  id: string;
  sessions: number;
  created_at: string;
  updated_at: string;
};

type CloudTodo = Database['public']['Tables']['todos']['Row'];
type CloudNote = Database['public']['Tables']['notes']['Row'];
type CloudEvent = Database['public']['Tables']['events']['Row'];
type CloudPomodoro = Database['public']['Tables']['pomodoro_settings']['Row'];

type CloudData = CloudTodo | CloudNote | CloudEvent | CloudPomodoro;

type LocalData = LocalTodo | LocalNote | LocalEvent | LocalPomodoro;

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const { isAuthenticated, userProfile } = useSettings();

  const checkSubscriptionStatus = async () => {
    if (!userProfile?.id) return;

    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', userProfile.id)
        .single();

      if (error) throw error;
      setSubscriptionStatus(subscription.status);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setSubscriptionStatus(null);
    }
  };

  const enableSync = async () => {
    if (!isAuthenticated || !userProfile?.id) {
      toast.error('Please sign in to enable sync');
      return;
    }

    await checkSubscriptionStatus();
    if (subscriptionStatus !== 'active') {
      toast.error('Active subscription required for sync');
      return;
    }

    setIsEnabled(true);
    await syncData();
  };

  const disableSync = () => {
    setIsEnabled(false);
    setLastSynced(null);
  };

  const validateAndSync = async (dataType: DataType) => {
    if (!isAuthenticated || !userProfile?.id || !isEnabled || subscriptionStatus !== 'active') {
      toast.error('Active subscription required for sync');
      return;
    }

    try {
      const evolveData = JSON.parse(localStorage.getItem('evolve_data') || '{}');
      const localData = JSON.parse(evolveData[`_${dataType}`] || '[]') as LocalData[];
      const { data: cloudData, error } = await supabase
        .from(dataType)
        .select('*')
        .eq('user_id', userProfile.id);

      if (error) throw error;

      const formattedLocalData = localData.map((item) => ({
        id: item.id,
        user_id: userProfile.id,
        ...(dataType === 'todos' ? { 
          title: (item as LocalTodo).title.substring(0, 100),
          completed: (item as LocalTodo).completed 
        } :
          dataType === 'notes' ? { content: (item as LocalNote).content } :
          dataType === 'events' ? { title: (item as LocalEvent).title, date: (item as LocalEvent).date, time: (item as LocalEvent).time, description: (item as LocalEvent).description } :
          { sessions: (item as LocalPomodoro).sessions }),
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      const formattedCloudData = cloudData.map((item: CloudData) => ({
        id: item.id,
        ...(dataType === 'todos' ? { 
          title: (item as CloudTodo).title.substring(0, 100),
          completed: (item as CloudTodo).completed 
        } :
          dataType === 'notes' ? { content: (item as CloudNote).content } :
          dataType === 'events' ? { title: (item as CloudEvent).title, date: (item as CloudEvent).date, time: (item as CloudEvent).time, description: (item as CloudEvent).description } :
          { sessions: (item as CloudPomodoro).sessions }),
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      const localNewer = formattedLocalData.filter((local) => {
        const cloud = formattedCloudData.find((cloud) => cloud.id === local.id);
        return !cloud || new Date(local.updated_at) > new Date(cloud.updated_at);
      });

      const cloudNewer = formattedCloudData.filter((cloud) => {
        const local = formattedLocalData.find((local) => local.id === cloud.id);
        return !local || new Date(cloud.updated_at) > new Date(local.updated_at);
      });

      if (localNewer.length > 0) {
        const { error: upsertError } = await supabase
          .from(dataType)
          .upsert(localNewer);

        if (upsertError) throw upsertError;
      }

      if (cloudNewer.length > 0) {
        evolveData[`_${dataType}`] = JSON.stringify(cloudNewer);
        localStorage.setItem('evolve_data', JSON.stringify(evolveData));
      }

      setLastSynced(new Date());
    } catch (error) {
      console.error(`Error syncing ${dataType}:`, error);
      toast.error(`Failed to sync ${dataType}`);
    }
  };

  const syncData = async () => {
    if (!isAuthenticated || !userProfile?.id || !isEnabled || subscriptionStatus !== 'active') {
      toast.error('Active subscription required for sync');
      return;
    }

    setIsSyncing(true);
    try {
      await Promise.all([
        validateAndSync('todos'),
        validateAndSync('notes'),
        validateAndSync('events'),
        validateAndSync('pomodoro_settings')
      ]);
      setLastSynced(new Date());
      toast.success('Sync completed successfully');
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('Failed to sync data');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isEnabled && isAuthenticated && userProfile?.id) {
      checkSubscriptionStatus();
      if (subscriptionStatus === 'active') {
        syncData();
      }
    }
  }, [isEnabled, isAuthenticated, userProfile?.id, subscriptionStatus]);

  return (
    <SyncContext.Provider
      value={{
        isSyncing,
        isEnabled,
        lastSynced,
        subscriptionStatus,
        enableSync,
        disableSync,
        validateAndSync,
        syncData
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}; 