import React from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { useLanguage, Language } from "../../context/LanguageContext";
import { supabase } from "../../integrations/supabase/client";
import { Database } from "../../integrations/supabase/types";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Trash2,
  AlertTriangle,
  FileDown,
  Monitor,
  MessageCircleHeart,
  HelpCircle,
  Globe,
  UserIcon,
  QuoteIcon,
  MessageSquareQuote,
  Quote,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SubscriptionModal from "./SubscriptionModal";
import FeedbackDialog from "./FeedbackDialog";
import Logo from "../Logo/Logo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AuthDialog from "@/components/Auth/AuthDialog";
import { TooltipProvider } from "../ui/tooltip";
import { TooltipContent } from "../ui/tooltip";
import { Tooltip } from "../ui/tooltip";
import { TooltipTrigger } from "../ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface SettingsButtonProps {
  onClick: () => void;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className="p-2 size-8 absolute top-4 right-3  rounded-full backdrop-blur-md transition-all z-10
          shadow-sm hover:shadow-md dark:hover:bg-black/30 dark:active:bg-black/40 active:bg-black/40 text-white/90 hover:text-white border-white/10 hover:border-white/20 bottom-4  text-white hover:bg-black/30"
          >
            <Settings className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" children={t("settings")} />
      </Tooltip>
    </TooltipProvider>
  );
};

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

const SettingsSidebar = ({ setRefreshKey }: { setRefreshKey: (key: number) => void }) => {
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

  const { language, setLanguage, t } = useLanguage();

  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] =
    React.useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = React.useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] =
    React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);
  const [deleteAccountError, setDeleteAccountError] = React.useState<
    string | null
  >(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  const storage = localStorage.getItem("evolve_data");
  const displayNameObj = JSON.parse(storage || "{}")?.display_name;
  const dailyQuoteObj = JSON.parse(storage || "{}")?.dailyQuote;
  const [displayName, setDisplayName] = useLocalStorage('display_name', '');
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
      setShowAuthModal(true);
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
    const style = document.createElement("style");
    style.textContent = sparkleKeyframes;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteAccountError(null);

    try {
      const { error } = await supabase.functions.invoke("delete-user");

      //    create supabase function to delete user and delete polar customer

      if (error) {
        setDeleteAccountError(error.message || t("failedToDeleteAccount"));
        setIsDeletingAccount(false);
        return;
      }

      // Clear local storage
      localStorage.clear();

      // Sign out the user
      await signOut();

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Error deleting account:", error);
      setDeleteAccountError("An unexpected error occurred. Please try again.");
      setIsDeletingAccount(false);
    }
  };

  const handleExportData = () => {
    try {
      // Get data from localStorage
      const evolveData = JSON.parse(
        localStorage.getItem("evolve_data") || "{}"
      );

      // Extract the relevant data
      const exportData = {
        todos: evolveData.todos?.value || [],
        notes: evolveData.notes?.value || [],
        events: evolveData["dashboard-events"]?.value || [],
        pomodoro: evolveData["pomodoro-settings"]?.value || {},
        exportDate: new Date().toISOString(),
      };

      // Create a blob and download link
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      // Create a temporary link element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `evolve-data-export-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.json`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      // You could add a toast notification here if you have one
    }
  };

  return (
    <>
      <SettingsButton onClick={() => setIsSettingsOpen(true)} />

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-white dark:bg-black/90 border border-white/0 dark:border-white/5 backdrop-blur-xl p-0 max-w-4xl max-h-[90vh] font-['Inter']">
          <div className="h-[min(60vh,calc(100vh-8rem))] flex">
            <Tabs defaultValue="widgets" className="w-full flex">
              <div className="w-64 border-r border-black/10 dark:border-white/10 p-4 flex flex-col h-full">
                <DialogHeader className="mb-4">
                  <DialogTitle className="flex items-center gap-2 text-black dark:text-white text-xl font-medium tracking-tight">
                    {t("settings")}
                  </DialogTitle>
                </DialogHeader>

                <TabsList className="flex flex-col h-auto bg-transparent space-y-1">
                  <TabsTrigger
                    value="widgets"
                    className="flex items-center gap-2 justify-start w-full py-3 px-3 rounded-lg transition-all duration-200 data-[state=active]:bg-black/5 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm hover:bg-black/5 dark:hover:bg-white/10 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md dark:group-hover:bg-white/20 transition-colors">
                      <Monitor className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{t("display")}</span>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/0 dark:bg-white/0 data-[state=active]:bg-black/20 dark:data-[state=active]:bg-white/20 transition-colors rounded-tl-md rounded-bl-md"></div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="profile"
                    className="flex items-center gap-2 justify-start w-full py-3 px-3 rounded-lg transition-all duration-200 data-[state=active]:bg-black/5 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm hover:bg-black/5 dark:hover:bg-white/10 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md dark:group-hover:bg-white/20 transition-colors">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{t("profile")}</span>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/0 dark:bg-white/0 data-[state=active]:bg-black/20 dark:data-[state=active]:bg-white/20 transition-colors rounded-tl-md rounded-bl-md"></div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="sync"
                    className="flex items-center gap-2 justify-start w-full py-3 px-3 rounded-lg transition-all duration-200 data-[state=active]:bg-black/5 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm hover:bg-black/5 dark:hover:bg-white/10 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md dark:group-hover:bg-white/20 transition-colors">
                      <Cloud className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{t("data")}</span>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/0 dark:bg-white/0 data-[state=active]:bg-black/20 dark:data-[state=active]:bg-white/20 transition-colors rounded-tl-md rounded-bl-md"></div>
                  </TabsTrigger>
                  {isAuthenticated &&
                    (!isPremium || userProfile?.polar_customer_id) && (
                      <TabsTrigger
                        value="billing"
                        className="flex items-center gap-2 justify-start w-full py-3 px-3 rounded-lg transition-all duration-200 data-[state=active]:bg-black/5 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm hover:bg-black/5 dark:hover:bg-white/10 relative overflow-hidden group"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-md dark:group-hover:bg-white/20 transition-colors">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{t("billing")}</span>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/0 dark:bg-white/0 data-[state=active]:bg-black/20 dark:data-[state=active]:bg-white/20 transition-colors rounded-tl-md rounded-bl-md"></div>
                      </TabsTrigger>
                    )}
                  <TabsTrigger
                    value="about"
                    className="flex items-center gap-2 justify-start w-full py-3 px-3 rounded-lg transition-all duration-200 data-[state=active]:bg-black/5 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm hover:bg-black/5 dark:hover:bg-white/10 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-md dark:group-hover:bg-white/20 transition-colors">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{t("about")}</span>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/0 dark:bg-white/0 data-[state=active]:bg-black/20 dark:data-[state=active]:bg-white/20 transition-colors rounded-tl-md rounded-bl-md"></div>
                  </TabsTrigger>
                </TabsList>

                {/* Spacer to push feedback button to bottom */}
                <div className="flex-grow"></div>

                {/* Feedback button at the bottom */}
                <div className="w-full mb-4">
                  <div
                    onClick={() => setShowFeedbackDialog(true)}
                    className="w-full p-2 rounded-lg cursor-pointer transition-all duration-300
                      bg-gradient-to-br from-black via-zinc-900 to-black
                      hover:from-black hover:via-zinc-900 hover:to-black
                      border border-white/10 dark:border-zinc-900 dark:hover:border-zinc-800 hover:border-white/20
                      relative overflow-hidden group shadow-md hover:shadow-lg"
                  >
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-shimmer" />

                    {/* Sparkle effects - only show on larger screens */}
                    <div className="absolute inset-0 hidden sm:block">
                      {/* Small sparkles */}
                      <div className="absolute top-1/3 right-1/4 h-1 w-1 bg-white/60 rounded-full animate-[sparkle_3s_ease-in-out_infinite_0.7s]" />
                      <div className="absolute bottom-1/3 left-1/4 h-1 w-1 bg-white/60 rounded-full animate-[sparkle_3.5s_ease-in-out_infinite_1.2s]" />
                    </div>

                    <div className="relative z-10 flex items-center gap-2">
                      <div className="p-1 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                        <MessageCircleHeart className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-sm font-medium text-white">
                          {t("feedback")}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                  <TabsContent value="widgets" className="mt-0">
                    <h3 className="mb-3 text-base font-medium text-black dark:text-white flex items-center gap-2">
                      <Layout className="h-4 w-4" />
                      <span>{t("widgetVisibility")}</span>
                    </h3>
                    <div className="space-y-0 border px-4 py-2 bg-black/5 dark:glass-dark select-none dark:bg-white/5 rounded-lg border-black/10 dark:border-white/10">
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-2 text-black/70 dark:text-white/70 text-base">
                          <StickyNote className="h-4 w-4" />
                          <span>{t("notes")}</span>
                        </div>
                        <Switch
                          checked={widgetVisibility?.notes}
                          onCheckedChange={() => toggleWidget("notes")}
                        />
                      </div>
                      <Separator className="bg-black/10 dark:bg-white/10" />

                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-2 text-black/70 dark:text-white/70 text-base">
                          <CheckSquare className="h-4 w-4" />
                          <span>{t("todoList")}</span>
                        </div>
                        <Switch
                          checked={widgetVisibility?.todoList}
                          onCheckedChange={() => toggleWidget("todoList")}
                        />
                      </div>
                      <Separator className="bg-black/10 dark:bg-white/10" />

                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-2 text-black/70 dark:text-white/70 text-base">
                          <Timer className="h-4 w-4" />
                          <span>{t("pomodoroTimer")}</span>
                        </div>
                        <Switch
                          checked={widgetVisibility?.pomodoro}
                          onCheckedChange={() => toggleWidget("pomodoro")}
                        />
                      </div>
                      <Separator className="bg-black/10 dark:bg-white/10" />

                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-2 text-black/70 dark:text-white/70 text-base">
                          <CalendarDays className="h-4 w-4" />
                          <span>{t("events")}</span>
                        </div>
                        <Switch
                          checked={widgetVisibility?.events}
                          onCheckedChange={() => toggleWidget("events")}
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="mb-3 text-base font-medium text-black dark:text-white flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <span>{t("interface")}</span>
                      </h3>
                      <div className="flex flex-col gap-2">
                        <div className="px-4 border select-none dark:bg-white/5 rounded-lg border-black/10 dark:border-white/10">
                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-2 text-black/70 dark:text-white/70 text-base">
                              <Globe className="h-4 w-4" />
                              <span>{t("language")}</span>
                            </div>
                            <Select
                              value={language}
                              onValueChange={(value) =>
                                setLanguage(value as Language)
                              }
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">
                                  {t("english")}
                                </SelectItem>
                                <SelectItem value="de">
                                  {t("german")}
                                </SelectItem>
                                <SelectItem value="es">
                                  {t("spanish")}
                                </SelectItem>
                                <SelectItem value="fr">
                                  {t("french")}
                                </SelectItem>
                                <SelectItem value="it">
                                  {t("italian")}
                                </SelectItem>
                                <SelectItem value="ru">
                                  {t("russian")}
                                </SelectItem>
                                <SelectItem value="ja">
                                  {t("japanese")}
                                </SelectItem>
                                {/* <SelectItem value="ko">{t('korean')}</SelectItem> */}
                                {/* <SelectItem value="pt">{t('portuguese')}</SelectItem> */}
                                {/* <SelectItem value="zh">{t('chinese')}</SelectItem> */}
                                {/* <SelectItem value="hi">{t('hindi')}</SelectItem> */}
                                {/* <SelectItem value="pl">{t('polish')}</SelectItem> */}
                                {/* <SelectItem value="nl">{t('dutch')}</SelectItem> */}
                                {/* <SelectItem value="ar">{t('arabic')}</SelectItem> */}
                                {/* <SelectItem value="tr">{t('turkish')}</SelectItem> */}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="px-4 border select-none dark:bg-white/5 rounded-lg border-black/10 dark:border-white/10">
                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-2 text-black/70 dark:text-white/70 text-base">
                              <Quote className="h-4 w-4" />
                              <span>Show quote</span>
                            </div>
                            <Switch
                              checked={dailyQuoteObj?.show !== false}
                              onCheckedChange={() => {
                                localStorage.setItem("evolve_data", JSON.stringify({
                                  ...JSON.parse(localStorage.getItem("evolve_data") || "{}"),
                                  dailyQuote: {
                                    ...dailyQuoteObj,
                                    show: dailyQuoteObj?.show ? false : true
                                  },
                                }));
                                setRefreshKey(Math.random());
                              }}
                            />
                          </div>
                        </div>
                        <div className="px-4 border select-none dark:bg-white/5 rounded-lg border-black/10 dark:border-white/10">
                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-2 text-black/70 dark:text-white/70 text-base">
                              <UserIcon className="h-4 w-4" />
                              <span>Show display name</span>
                            </div>
                            <Switch
                              checked={displayNameObj?.show !== false}
                              onCheckedChange={() => {
                                localStorage.setItem("evolve_data", JSON.stringify({
                                  ...JSON.parse(localStorage.getItem("evolve_data") || "{}"),
                                  display_name: {
                                    ...displayNameObj,
                                    show: displayNameObj?.show ? false : true
                                  },
                                }));
                                setRefreshKey(Math.random());
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="profile" className="mt-0">
                    <h3 className="mb-3 text-base font-medium text-black dark:text-white flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{t("userProfile")}</span>
                    </h3>

                    <div className="space-y-3 flex flex-col gap-2">
                      {isAuthenticated ? (
                        <div className="flex flex-col space-y-2">
                          <div className="border px-4 py-2 bg-black/5 border-black/10 dark:border-white/10 dark:glass-dark dark:bg-white/5 rounded-lg mb-2">
                            <div className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-2 text-black/70 dark:text-white/70 text-base">
                                <span>{t("email")}</span>
                              </div>
                              <span className="text-sm font-medium text-black/70 dark:text-white/70">
                                {userEmail}
                              </span>
                            </div>
                            <Separator className="bg-black/10 dark:bg-white/10" />

                            <div className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-2 text-black/70 dark:text-white/70 text-base">
                                <span>{t("accountType")}</span>
                              </div>
                              <span className="text-sm text-black/70 dark:text-white/70 flex items-center gap-1">
                                {isPremium ? "Premium" : <>Free</>}
                              </span>
                            </div>
                          </div>

                          <Button
                            className="w-full mt-2"
                            variant="outline"
                            onClick={signOut}
                            disabled={isSyncing}
                          >
                            <LogOut className="h-4 w-4" />
                            {t("signOut")}
                          </Button>

                          <div className="mt-4 pt-4">
                            <h3 className="mb-3 text-base font-medium text-black dark:text-white flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              <span>{t("dangerArea")}</span>
                            </h3>

                            <Button
                              className="w-full transition-all duration-300 shadow-none"
                              variant="destructive"
                              onClick={() => setShowDeleteAccountDialog(true)}
                              disabled={isSyncing || isDeletingAccount}
                            >
                              {/* <Trash2 className="h-4 w-4" /> */}
                              {t("deleteAccount")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start gap-3 py-4 px-4 bg-black/5 dark:bg-white/5 rounded-lg dark:glass-dark border border-black/10 dark:border-white/10 shadow-sm">
                            <Info className="h-5 w-5 text-black/60 dark:text-white/60 mt-0.5 flex-shrink-0" />
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-medium text-black/80 dark:text-white/80">
                                {t("signInToAccount")}
                              </p>
                              <p className="text-sm text-black/60 dark:text-white/60">
                                {t("accessProfile")}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowAuthModal(true);
                              setIsSettingsOpen(false);
                            }}
                            className="w-full bg-white dark:bg-black/50 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            {t("signIn")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="sync" className="mt-0">
                    <h3 className="mb-3 text-base font-medium text-black dark:text-white flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      <span>{t("dataSynchronization")}</span>
                    </h3>

                    <div className="space-y-3 flex flex-col gap-2">
                      <div className="flex flex-col space-y-2 border border-black/10 dark:border-white/10 px-4 py-2 bg-black/5 dark:glass-dark rounded-lg dark:bg-white/5">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2 text-black/70 dark:text-white/70 text-base">
                            <span>{t("cloudSync")}</span>
                            {!isAuthenticated || !isPremium ? (
                              <span className="text-xs bg-black/10 text-black dark:text-white px-2 py-0.5 rounded select-none">
                                {t("premium")}
                              </span>
                            ) : null}
                          </div>
                          <Switch
                            checked={userProfile?.cloud_sync_enabled || false}
                            onCheckedChange={toggleSyncEnabled}
                            disabled={
                              !isAuthenticated || isSyncing || !isPremium
                            }
                          />
                        </div>
                        <Separator className="bg-black/10 dark:bg-white/10" />

                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2 text-black/70 dark:text-white/70 text-base">
                            <span>{t("lastSynced")}</span>
                          </div>
                          <span
                            className={`text-sm ${
                              !userProfile?.last_synced
                                ? "text-black dark:text-white"
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
                          <span>{t("syncingData")}</span>
                        </div>
                      )}

                      {isAuthenticated &&
                        isPremium &&
                        !userProfile?.cloud_sync_enabled && (
                          <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg">
                            <Cloud className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span className="leading-tight text-base">
                              {t("cloudSyncIsCurrentlyDisabled")}
                            </span>
                          </div>
                        )}

                      {isAuthenticated && (
                        <div className="mt-4 border-black/10 dark:border-white/10 pt-4">
                          <h3 className="mb-3 text-base font-medium text-black dark:text-white flex items-center gap-2">
                            <FileDown className="h-4 w-4" />
                            <span>{t("dataExport")}</span>
                          </h3>

                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={handleExportData}
                          >
                            <FileDown className="h-4 w-4" />
                            {t("exportData")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {isAuthenticated &&
                    (!isPremium || userProfile?.polar_customer_id) && (
                      <TabsContent value="billing" className="mt-0">
                        <h3 className="mb-4 text-base font-medium text-black dark:text-white flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>{t("billing")}</span>
                        </h3>

                        <div className="space-y-4">
                          {isAuthenticated && !isPremium && (
                            <Button
                              className="w-full bg-gradient-to-r from-black via-white/10 to-black dark:shadow-indigo-500/20 shadow-indigo-500/20 dark:hover:shadow-indigo-500/30 text-white animate-shimmer relative dark:border-2 border-white/5"
                              onClick={handleUpgradeClick}
                            >
                              <Sparkles className="h-4 w-4 relative z-10" />
                              <span className="relative z-10">
                                {t("upgradeToPremium")}
                              </span>
                            </Button>
                          )}

                          {isAuthenticated &&
                            userProfile?.polar_customer_id && (
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
                                {t("manageBilling")}
                              </Button>
                            )}
                        </div>
                      </TabsContent>
                    )}

                  <TabsContent value="about" className="mt-0">
                    <h3 className="mb-3 text-base font-medium text-black dark:text-white flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      <span>{t("aboutEvolve")}</span>
                    </h3>

                    <div className="flex flex-col space-y-5">
                      <div className="border border-black/15 dark:border-white/10 rounded-lg overflow-hidden">
                        <div className="p-5 text-sm text-black/80 dark:text-white/80 space-y-4 bg-black/5 dark:bg-white/5 dark:glass-dark">
                          <p>{t("evolveCreated")}</p>

                          <p>{t("evolveFocus")}</p>

                          {/*                           <div className="flex items-start gap-3 py-3 px-4 bg-amber-100/50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-md">
                            <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium mb-1">Supporting Evolve</p>
                              <p className="text-sm">
                                Maintaining and improving Evolve requires significant time and resources. As a solo developer project, your Premium subscription directly supports ongoing development and server costs, helping to keep Evolve running and growing with new features.
                              </p>
                            </div>
                          </div> */}
                        </div>
                      </div>

                      <div className="border border-black/10 dark:border-white/10 rounded-lg p-5 bg-black/5 dark:bg-white/5 dark:glass-dark">
                        <h4 className="text-sm font-medium text-black dark:text-white mb-3">
                          {t("haveQuestionsOrNeedHelp")}
                        </h4>
                        <p className="text-sm text-black/70 dark:text-white/70 mb-3">
                          {t("haveQuestionsOrNeedHelpDescription")}
                        </p>
                        <a
                          href="mailto:support@evolve-app.com"
                          className="inline-flex items-center gap-2 text-sm font-medium text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          support@evolve-app.com
                        </a>
                      </div>

                      <div className="flex flex-col items-center mt-auto pt-6">
                        <Logo className="h-10 w-10 flex justify-center items-center mb-3" />
                        <div className="text-sm text-black/50 dark:text-white/50">
                          {t("version")}
                        </div>
                        <div className="text-xs text-black/40 dark:text-white/40 mt-1">
                          © {new Date().getFullYear()} Evolve
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <SubscriptionModal
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
      />

      <FeedbackDialog
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
      />

      <AlertDialog
        open={showDeleteAccountDialog}
        onOpenChange={setShowDeleteAccountDialog}
      >
        <AlertDialogContent className="font-['Inter']">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <span>{t("deleteAccount")}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-black/70 dark:text-white/70">
              <p className="mb-2">{t("deleteAccountWarning")}</p>

              {isPremium && (
                <div className="p-3 mb-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-md">
                  <p className="font-medium">
                    {t("activeSubscriptionWarning")}
                  </p>
                  <p className="text-sm">
                    {t("activeSubscriptionWarningDescription")}
                  </p>
                </div>
              )}

              <p>{t("areYouSureYouWantToProceed")}</p>

              {deleteAccountError && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-md">
                  <p className="text-sm">{deleteAccountError}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700">
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-red-800 shadow-sm hover:shadow-md dark:shadow-red-900/20 dark:hover:shadow-red-900/30 transition-all duration-300"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {t("deleteAccount")}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AuthDialog open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
};

export default SettingsSidebar;
