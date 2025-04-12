import React from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { supabase } from "../../integrations/supabase/client";
import { Database } from "../../integrations/supabase/types";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
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
  MessageSquare,
  Layout,
  MessageCircle,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import SubscriptionModal from "./SubscriptionModal";
import FeedbackDialog from "./FeedbackDialog";
import Logo from "../Logo/Logo";

interface SettingsButtonProps {
  onClick: () => void;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 size-8 absolute top-4 right-3  rounded-full backdrop-blur-md transition-all z-10
          shadow-sm hover:shadow-md dark:hover:bg-black/30 dark:active:bg-black/40 active:bg-black/40 text-white/90 hover:text-white border-white/10 hover:border-white/20 bottom-4  text-white hover:bg-black/30"
      title="Settings"
    >
      <Settings className="size-4" />
    </button>
  );
};

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

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
    subscription,
  } = useSettings();

  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] =
    React.useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getUserEmail = async () => {
      if (isAuthenticated) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserEmail(user?.email || null);
      }
    };
    getUserEmail();
  }, [isAuthenticated]);

  const isPremium = subscription?.status === "active";

  const handleAuthClick = () => {
    if (isAuthenticated) {
      signOut();
    } else {
      navigate("/auth");
      setIsSettingsOpen(false);
    }
  };

  const handleUpgradeClick = () => {
    setShowSubscriptionModal(true);
  };

  const formatLastSynced = () => {
    if (!userProfile?.last_synced) return "Never";

    const date = new Date(userProfile.last_synced);

    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`;
    }

    if (isYesterday(date)) {
      return `Yesterday at ${format(date, "h:mm a")}`;
    }

    return formatDistanceToNow(date, { addSuffix: true });
  };

  const sparkleKeyframes = `
    @keyframes sparkle {
      0%, 100% { opacity: 0.2; transform: scale(0.6); }
      50% { opacity: 1; transform: scale(1); }
    }
    @keyframes shooting {
      0% { transform: translateX(-100%) translateY(100%) rotate(-45deg); opacity: 0; }
      20%, 80% { opacity: 1; }
      100% { transform: translateX(200%) translateY(-200%) rotate(-45deg); opacity: 0; }
    }
  `;

  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = sparkleKeyframes;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <SettingsButton onClick={() => setIsSettingsOpen(true)} />

      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent className="glass dark:glass-dark border-l border-white/0 dark:border-white/5 dark:bg-transparent backdrop-blur-xl p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 border-b border-black/10 dark:border-white/10">
              <SheetTitle className="flex items-center gap-2 text-black dark:text-white text-base">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 border-b border-black/10 dark:border-white/10">
                <h3 className="mb-4 text-base font-medium text-black dark:text-white flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  <span>Widget Visibility</span>
                </h3>
                <div className="space-y-0">
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-2 text-black/70 dark:text-white/70">
                      <StickyNote className="h-4 w-4" />
                      <span>Notes</span>
                    </div>
                    <Switch
                      checked={widgetVisibility.notes}
                      onCheckedChange={() => toggleWidget("notes")}
                    />
                  </div>
                  <Separator className="bg-black/10 dark:bg-white/10" />
                  
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-2 text-black/70 dark:text-white/70">
                      <CheckSquare className="h-4 w-4" />
                      <span>Todo List</span>
                    </div>
                    <Switch
                      checked={widgetVisibility.todoList}
                      onCheckedChange={() => toggleWidget("todoList")}
                    />
                  </div>
                  <Separator className="bg-black/10 dark:bg-white/10" />

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-2 text-black/70 dark:text-white/70">
                      <Timer className="h-4 w-4" />
                      <span>Pomodoro Timer</span>
                    </div>
                    <Switch
                      checked={widgetVisibility.pomodoro}
                      onCheckedChange={() => toggleWidget("pomodoro")}
                    />
                  </div>
                  <Separator className="bg-black/10 dark:bg-white/10" />

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-2 text-black/70 dark:text-white/70">
                      <CalendarDays className="h-4 w-4" />
                      <span>Events</span>
                    </div>
                    <Switch
                      checked={widgetVisibility.events}
                      onCheckedChange={() => toggleWidget("events")}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-black/10 dark:border-white/10">
                <h3 className="mb-3 text-base font-medium text-black dark:text-white flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>User Profile</span>
                </h3>

                <div className="space-y-3 flex flex-col gap-2">
                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 text-black/70 dark:text-white/70">
                          <span>Email</span>
                        </div>
                        <span className="text-sm text-black/50 dark:text-white/50">
                          {userEmail}
                        </span>
                      </div>
                      <Separator className="bg-black/10 dark:bg-white/10" />

                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 text-black/70 dark:text-white/70">
                          <span>Account Type</span>
                        </div>
                        <span className={`text-sm ${isPremium ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"} flex items-center gap-1`}>
                          {isPremium ? "Premium" : (
                            <>
                              <Lock className="h-3 w-3" />
                              Free
                            </>
                          )}
                        </span>
                      </div>
                      
                      <Button
                        className="w-full mt-2"
                        variant="outline"
                        onClick={signOut}
                        disabled={isSyncing}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-4">
                      <p className="text-sm text-black/50 dark:text-white/50 text-center">
                        Sign in to access your profile and sync your data across devices
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate("/auth");
                          setIsSettingsOpen(false);
                        }}
                        className="w-full"
                      >
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t">
                <h3 className="mb-3 text-base font-medium text-black dark:text-white flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  <span>Data Synchronization</span>
                </h3>

                <div className="space-y-3 flex flex-col gap-2">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 text-black/70 dark:text-white/70">
                        <span>Cloud Sync</span>
                        {!isAuthenticated || !isPremium ? (
                          <span className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-2 py-0.5 rounded">
                            Premium
                          </span>
                        ) : null}
                      </div>
                      <Switch
                        checked={userProfile?.cloud_sync_enabled || false}
                        onCheckedChange={toggleSyncEnabled}
                        disabled={!isAuthenticated || isSyncing || !isPremium}
                      />
                    </div>
                    <Separator className="bg-black/10 dark:bg-white/10" />

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 text-black/70 dark:text-white/70">
                        <span>Last synced</span>
                      </div>
                      <span
                        className={`text-sm ${
                          !userProfile?.last_synced
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-black/50 dark:text-white/50"
                        }`}
                      >
                        {formatLastSynced()}
                      </span>
                    </div>
                  </div>

                  {isSyncing && (
                    <div className="flex items-center justify-center text-sm text-black/50 dark:text-white/50 bg-black/5 dark:bg-white/5 p-2 rounded-lg">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span>Syncing data...</span>
                    </div>
                  )}

                  {isAuthenticated && isPremium && !userProfile?.cloud_sync_enabled && (
                    <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg">
                      <Cloud className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">
                        Cloud sync is currently disabled. Enable it to keep
                        your data backed up and synchronized across devices.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {isAuthenticated &&
                (!isPremium || userProfile?.polar_customer_id) && (
                  <div className="p-6 border-t border-black/10 dark:border-white/10">
                    <h3 className="mb-4 text-base font-medium text-black dark:text-white flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Billing</span>
                    </h3>

                    <div className="space-y-4">
                      {isAuthenticated && !isPremium && (
                        <Button
                          className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 dark:shadow-amber-500/20 shadow-amber-500/20 dark:hover:shadow-amber-500/30 text-white animate-shimmer relative"
                          onClick={handleUpgradeClick}
                        >
                          <CreditCard className="h-4 w-4 relative z-10" />
                          <span className="relative z-10">
                            Upgrade to Premium
                          </span>
                        </Button>
                      )}

                      {isAuthenticated && userProfile?.polar_customer_id && (
                        <Button
                          onClick={async () => {
                            try {
                              const { data, error } =
                                await supabase.functions.invoke(
                                  "create-billing-session"
                                );
                              if (error) throw error;
                              window.location.href = data.url;
                            } catch (error) {
                              console.error(
                                "Error creating billing session:",
                                error
                              );
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
                <div 
                  onClick={() => setShowFeedbackDialog(true)}
                  className="w-full p-6 rounded-xl cursor-pointer transition-all duration-300
                    bg-gradient-to-br from-purple-900/80 via-indigo-900/80 to-black 
                    hover:from-purple-800/90 hover:via-indigo-800/90 hover:to-black/90
                    border border-white/10 hover:border-white/20
                    relative overflow-hidden group"
                >
                  {/* Sparkle effects */}
                  <div className="absolute inset-0">
                    {/* Large sparkles */}
                    <div className="absolute top-1/4 left-1/4 h-2 w-2 bg-white/80 rounded-full animate-[sparkle_3s_ease-in-out_infinite]" />
                    <div className="absolute top-3/4 right-1/4 h-2 w-2 bg-purple-300/80 rounded-full animate-[sparkle_4s_ease-in-out_infinite_1s]" />
                    <div className="absolute bottom-1/3 left-1/2 h-2 w-2 bg-indigo-300/80 rounded-full animate-[sparkle_3.5s_ease-in-out_infinite_0.5s]" />
                    
                    {/* Medium sparkles */}
                    <div className="absolute top-1/2 right-1/3 h-1.5 w-1.5 bg-white/70 rounded-full animate-[sparkle_4s_ease-in-out_infinite_1.5s]" />
                    <div className="absolute bottom-1/4 left-1/3 h-1.5 w-1.5 bg-purple-200/70 rounded-full animate-[sparkle_3s_ease-in-out_infinite_2s]" />
                    
                    {/* Small sparkles */}
                    <div className="absolute top-2/3 right-1/2 h-1 w-1 bg-indigo-200/60 rounded-full animate-[sparkle_3s_ease-in-out_infinite_0.7s]" />
                    <div className="absolute bottom-1/2 right-1/4 h-1 w-1 bg-white/60 rounded-full animate-[sparkle_3.5s_ease-in-out_infinite_1.2s]" />
                    
                    {/* Shooting star effect */}
                    <div className="absolute h-px w-16 bg-gradient-to-r from-transparent via-white to-transparent 
                      -rotate-45 animate-[shooting_4s_linear_infinite]
                      top-1/4 -left-8" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                    <Sparkles className="h-6 w-6 text-purple-300 group-hover:text-purple-200 transition-colors" />
                    <h4 className="text-lg font-medium text-white group-hover:text-purple-100 transition-colors">What do you think about Evolve?</h4>
                    <p className="text-sm text-purple-200/80 group-hover:text-purple-100/90 transition-colors">Share your thoughts and help us make Evolve even better!</p>
                  </div>
                </div>
                <Logo className="h-8 w-8 flex justify-center items-center" />
                <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
                  <Info className="h-3 w-3" />
                  <span>Version 1.0.0-beta.1</span>
                </div>
                <div className="text-[10px] text-black/30 dark:text-white/30 text-center">
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
