import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { supabase } from '../../integrations/supabase/client';
import { Database } from '../../integrations/supabase/types';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
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
  Download,
  Sidebar,
  MessageSquare
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import SubscriptionModal from './SubscriptionModal';
import FeedbackDialog from './FeedbackDialog';
import Logo from '../Logo/Logo';

interface SettingsButtonProps {
  onClick: () => void;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-14 bg-black/20 dark:bg-transparent text-white p-2 rounded-full backdrop-blur-md hover:bg-black/30 transition-colors z-10"
      title="Settings"
    >
      <Sidebar size={20} />
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
  const [showFeedbackDialog, setShowFeedbackDialog] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getUserEmail = async () => {
      if (isAuthenticated) {
        const { data: { user } } = await supabase.auth.getUser();
        setUserEmail(user?.email || null);
      }
    };
    getUserEmail();
  }, [isAuthenticated]);

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
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    }
    
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
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
                </h3>
                
                <div className="space-y-4">
                  <div className="text-sm text-black/70 dark:text-white/70">
                    {isAuthenticated ? (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Lock className="h-4 w-4" />
                        <span>Logged in as {userEmail}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Lock className="h-4 w-4" />
                        <span>Authentication required for sync</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-black/70 dark:text-white/70">
                    <div className="flex items-center gap-2">
                      <span>Last synced:</span>
                      <span className={`${!userProfile?.last_synced ? 'text-amber-600 dark:text-amber-400' : 'text-black/50 dark:text-white/50'}`}>
                        {formatLastSynced()}
                      </span>
                    </div>
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

                    {isAuthenticated && isPremium && !userProfile?.cloud_sync_enabled && (
                      <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded">
                        <Cloud className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">Cloud sync is currently disabled. Enable it to keep your data backed up and synchronized across devices.</span>
                      </div>
                    )}

                    <Button 
                      className="w-full mt-4"
                      variant="outline"
                      onClick={handleAuthClick}
                      disabled={isSyncing}
                    >
                      {isAuthenticated ? (
                        <>
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {(isAuthenticated && (!isPremium || userProfile?.polar_customer_id)) && (
                <div className="p-6 border-t border-black/10 dark:border-white/10">
                  <h3 className="mb-4 text-lg font-medium text-black dark:text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Billing</span>
                  </h3>

                  <div className="space-y-4">
                    {isAuthenticated && !isPremium && (
                      <Button 
                        className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white animate-shimmer relative"
                        onClick={handleUpgradeClick}
                      >
                        <CreditCard className="h-4 w-4 relative z-10" />
                        <span className="relative z-10">Upgrade to Premium</span>
                      </Button>
                    )}

                    {isAuthenticated && userProfile?.polar_customer_id && (
                      <Button
                        onClick={async () => {
                          try {
                            const { data, error } = await supabase.functions.invoke('create-billing-session');
                            if (error) throw error;
                            window.location.href = data.url;
                          } catch (error) {
                            console.error('Error creating billing session:', error);
                          }
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        <CreditCard className="h-4 w-4" />
                        Manage Billing
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-black/10 dark:border-white/10">
              <div className="flex flex-col items-center gap-4">
                <Button
                  variant="outline"
                  className="w-full mb-4"
                  onClick={() => setShowFeedbackDialog(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Leave Feedback
                </Button>
                <Logo className="h-8 w-8 flex justify-center items-center" />
                <div className="flex items-center gap-2 text-sm text-black/50 dark:text-white/50">
                  <Info className="h-4 w-4" />
                  <span>Version 1.0.0-beta.1</span>
                </div>
                <div className="text-xs text-black/30 dark:text-white/30 text-center">
                  <div>© {new Date().getFullYear()} Evolve</div>
                  <div>Developed by @zivtamary</div>
                  <div>Support: support@evolve-app.com</div>
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
      
      <FeedbackDialog
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
      />
    </>
  );
};

export default SettingsSidebar;