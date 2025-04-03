import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { supabase } from '../../integrations/supabase/client';
import { Database } from '../../integrations/supabase/types';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetClose 
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  StickyNote, 
  CheckSquare, 
  Timer, 
  CalendarDays, 
  Lock,
  LogIn,
  LogOut,
  Loader2,
  Cloud,
  Sparkles,
  CreditCard,
  Info,
  Download
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import SubscriptionModal from './SubscriptionModal';
import Logo from '../Logo/Logo';

interface SettingsButtonProps {
  onClick: () => void;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-14 bg-black/20 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/30 transition-colors z-10"
      title="Settings"
    >
      <Settings size={20} />
    </button>
  );
};

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

const SettingsSidebar = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    widgetVisibility, 
    toggleWidget,
    isAuthenticated,
    userProfile,
    toggleSyncEnabled,
    signOut,
    isLoading,
    isSyncing,
    subscription
  } = useSettings();
  
  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);

  const isPremium = subscription?.status === 'active';

  const handleAuthClick = () => {
    if (isAuthenticated) {
      signOut();
    } else {
      navigate('/auth');
      setIsSettingsOpen(false);
    }
  };

  const handleUpgradeClick = () => {
    setShowSubscriptionModal(true);
  };

  const formatLastSynced = () => {
    if (!userProfile?.last_synced) return 'Never';
    
    const date = new Date(userProfile.last_synced);
    return date.toLocaleString();
  };

  return (
    <>
      <SettingsButton onClick={() => setIsSettingsOpen(true)} />
      
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="glass dark:glass-dark border-l border-white/10 dark:border-white/10 border-black/10 backdrop-blur-xl p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 border-b border-black/10 dark:border-white/10">
              <SheetTitle className="flex items-center gap-2 text-black dark:text-white">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 border-b border-black/10 dark:border-white/10">
                <h3 className="mb-4 text-lg font-medium text-black dark:text-white">Widget Visibility</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-black/70 dark:text-white/70">
                      <StickyNote className="h-4 w-4" />
                      <span>Notes</span>
                    </div>
                    <Switch 
                      checked={widgetVisibility.notes} 
                      onCheckedChange={() => toggleWidget('notes')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-black/70 dark:text-white/70">
                      <CheckSquare className="h-4 w-4" />
                      <span>Todo List</span>
                    </div>
                    <Switch 
                      checked={widgetVisibility.todoList} 
                      onCheckedChange={() => toggleWidget('todoList')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-black/70 dark:text-white/70">
                      <Timer className="h-4 w-4" />
                      <span>Pomodoro Timer</span>
                    </div>
                    <Switch 
                      checked={widgetVisibility.pomodoro} 
                      onCheckedChange={() => toggleWidget('pomodoro')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-black/70 dark:text-white/70">
                      <CalendarDays className="h-4 w-4" />
                      <span>Events</span>
                    </div>
                    <Switch 
                      checked={widgetVisibility.events} 
                      onCheckedChange={() => toggleWidget('events')} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="mb-4 text-lg font-medium text-black dark:text-white flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  <span>Data Synchronization</span>
                  {!isAuthenticated || !isPremium ? (
                    <span className="ml-auto">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                    </span>
                  ) : null}
                </h3>
                
                <div className="space-y-4">
                  <div className="text-sm text-black/70 dark:text-white/70">
                    {isAuthenticated ? (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Lock className="h-4 w-4" />
                        <span>Logged in</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Lock className="h-4 w-4" />
                        <span>Authentication required for sync</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-black/70 dark:text-white/70">
                    Last synced: <span className="text-black/50 dark:text-white/50">{formatLastSynced()}</span>
                  </div>
                  
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-black/70 dark:text-white/70">
                        <span>Cloud Sync</span>
                        {!isAuthenticated || !isPremium ? (
                          <span className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-2 py-0.5 rounded">Premium</span>
                        ) : null}
                      </div>
                      <Switch 
                        checked={userProfile?.cloud_sync_enabled || false}
                        onCheckedChange={toggleSyncEnabled}
                        disabled={!isAuthenticated || isSyncing || !isPremium}
                      />
                    </div>
                    
                    {isSyncing && (
                      <div className="flex items-center justify-center text-sm text-black/50 dark:text-white/50">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Syncing data...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-black/10 dark:border-white/10">
                <h3 className="mb-4 text-lg font-medium text-black dark:text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Billing</span>
                </h3>

                <div className="space-y-4">
                  {!isPremium && (
                    <button 
                      className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors animate-shimmer relative"
                      onClick={handleUpgradeClick}
                    >
                      <CreditCard className="h-4 w-4 relative z-10" />
                      <span className="relative z-10">Upgrade to Premium</span>
                    </button>
                  )}

                  {isAuthenticated && userProfile?.polar_customer_id && (
                    <button
                      onClick={async () => {
                        try {
                          const { data, error } = await supabase.functions.invoke('create-billing-session');
                          if (error) throw error;
                          window.location.href = data.url;
                        } catch (error) {
                          console.error('Error creating billing session:', error);
                        }
                      }}
                      className="w-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                    >
                      <CreditCard className="h-4 w-4" />
                      Manage Billing
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-black/10 dark:border-white/10">
              {isAuthenticated ? (
                <button 
                  className="w-full mb-6 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                  onClick={handleAuthClick}
                  disabled={isSyncing}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : (
                <button 
                  className="w-full mb-6 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-black dark:text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                  onClick={handleAuthClick}
                  disabled={isSyncing}
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              )}

              <div className="flex flex-col items-center gap-4">
                <Logo className="h-8 w-8 flex justify-center items-center" />
                <div className="flex items-center gap-2 text-sm text-black/50 dark:text-white/50">
                  <Info className="h-4 w-4" />
                  <span>Version 1.0.0-beta.1</span>
                </div>
                <div className="text-xs text-black/30 dark:text-white/30 text-center">
                  <div>© 2024 Aesthetic Startpage</div>
                  <div>Developed by zivtamary</div>
                  <div>Support: zivtamary@gmail.com</div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      <SubscriptionModal 
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
      />
    </>
  );
};

export default SettingsSidebar;