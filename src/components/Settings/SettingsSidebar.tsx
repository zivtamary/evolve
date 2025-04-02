import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
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
  Info
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import SubscriptionModal from './SubscriptionModal';
import SubscriptionToggle from './SubscriptionToggle';
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

const SettingsSidebar = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    widgetVisibility, 
    toggleWidget,
    syncState,
    isAuthenticated,
    userProfile,
    toggleSyncEnabled,
    signOut,
    isLoading,
    setUserProfile
  } = useSettings();
  
  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);

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
    if (!syncState.lastSynced) return 'Never';
    
    const date = new Date(syncState.lastSynced);
    return date.toLocaleString();
  };

  return (
    <>
      <SettingsButton onClick={() => setIsSettingsOpen(true)} />
      
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="py-6">
            <h3 className="mb-4 text-lg font-medium">Widget Visibility</h3>
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <StickyNote className="h-4 w-4" />
                  <span>Notes</span>
                </div>
                <Switch 
                  checked={widgetVisibility.notes} 
                  onCheckedChange={() => toggleWidget('notes')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4" />
                  <span>Todo List</span>
                </div>
                <Switch 
                  checked={widgetVisibility.todoList} 
                  onCheckedChange={() => toggleWidget('todoList')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Timer className="h-4 w-4" />
                  <span>Pomodoro Timer</span>
                </div>
                <Switch 
                  checked={widgetVisibility.pomodoro} 
                  onCheckedChange={() => toggleWidget('pomodoro')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
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
          
          <Separator />
          
          <div className="py-6">
            <h3 className="mb-4 text-lg font-medium flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              <span>Data Synchronization</span>
              {!isAuthenticated || !userProfile?.isPremium ? (
                <span className="ml-auto">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </span>
              ) : null}
            </h3>
            
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {isAuthenticated ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <Lock className="h-4 w-4" />
                    <span>Logged in as {userProfile?.email}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Lock className="h-4 w-4" />
                    <span>Authentication required for sync</span>
                  </div>
                )}
              </div>
              
              {isAuthenticated && (
                <div className="p-3 border rounded-md bg-amber-50 border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Premium Status</span>
                    </div>
                    <SubscriptionToggle />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Toggle premium status for testing purposes
                  </p>
                </div>
              )}
              
              <div className="text-sm">
                Last synced: <span className="text-muted-foreground">{formatLastSynced()}</span>
              </div>
              
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Cloud Sync</span>
                    {!isAuthenticated || !userProfile?.isPremium ? (
                      <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded">Premium</span>
                    ) : null}
                  </div>
                  <Switch 
                    checked={syncState.enabled}
                    onCheckedChange={toggleSyncEnabled}
                    disabled={!isAuthenticated || isLoading || !userProfile?.isPremium}
                  />
                </div>
                
                {isLoading && (
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Syncing data...</span>
                  </div>
                )}
                
                {isAuthenticated && !userProfile?.isPremium && (
                  <Button 
                    variant="default" 
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
                    onClick={handleUpgradeClick}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleAuthClick}
                  disabled={isLoading}
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
          
          <Separator />
          
          <div className="py-6">
            <h3 className="mb-4 text-lg font-medium flex items-center gap-2">
              <Info className="h-5 w-5" />
              <span>About</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <Logo size="sm" />
              </div>
              
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Version 1.0.0</p>
                <p className="text-xs text-muted-foreground">© 2023-2024 Lovable</p>
                <p className="text-xs text-muted-foreground">All Rights Reserved</p>
              </div>
              
              <div className="p-3 border rounded-md bg-muted/50">
                <p className="text-xs text-center text-muted-foreground">
                  Developed with ❤️ by Lovable
                  <br />
                  <a 
                    href="https://lovable.dev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    lovable.dev
                  </a>
                </p>
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