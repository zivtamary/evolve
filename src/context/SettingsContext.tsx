
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

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

  const toggleWidget = (widget: keyof WidgetVisibility) => {
    setWidgetVisibility({
      ...widgetVisibility,
      [widget]: !widgetVisibility[widget],
    });
  };

  // This is a placeholder for the actual sync implementation
  const syncWithCloud = async () => {
    if (!isAuthenticated) {
      console.error('User must be authenticated to sync');
      return;
    }

    try {
      // In a real implementation, this would:
      // 1. For each data type, check timestamps between local and cloud
      // 2. If local is newer, push to cloud
      // 3. If cloud is newer, pull from cloud
      // 4. Update lastSynced timestamp
      
      // For now, we'll just update the lastSynced timestamp
      setSyncState({
        ...syncState,
        lastSynced: new Date().toISOString(),
      });
      
      console.log('Data synchronized with cloud');
    } catch (error) {
      console.error('Error syncing with cloud:', error);
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
