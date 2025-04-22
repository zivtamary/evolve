import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Clock,
  X,
  MoreVertical,
  Edit2,
  Trash2,
  Smile,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTheme } from "@/context/ThemeContext";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "../../context/SettingsContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useClickOutside } from "../../hooks/use-click-outside";
import useWindowSize from "@/hooks/use-window-size";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";   
interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;
}

interface CloudEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface NewEvent {
  title: string;
  date: string;
  time: string;
  description: string;
  icon?: string;
}

interface StoredEvents {
  value: Event[];
  timestamp: number;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const Events = () => {
  const { theme } = useTheme();
  const {
    syncEventsOnBlur,
    isAuthenticated,
    userProfile,
    setExpandedWidget,
    expandedWidget,
    widgetPositions,
  } = useSettings();
  const [events, setEvents] = useLocalStorage<Event[]>("events", []);
  const [activeTab, setActiveTab] = useState("all");
  const [dialogState, setDialogState] = useState<
    "closedFromOutSide" | "closed" | "create" | "edit"
  >("closed");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    description: "",
  });
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const eventsRef = useRef<HTMLDivElement>(null);
  const isExpanded = expandedWidget === "events";

  // Filter events based on active tab
  const getFilteredEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return events
      .filter((event) => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);

        if (activeTab === "week") {
          return eventDate >= today && eventDate <= endOfWeek;
        } else if (activeTab === "month") {
          return eventDate >= today && eventDate <= endOfMonth;
        }
        return true; // For "all" tab, return all events
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        dateA.setHours(0, 0, 0, 0);
        dateB.setHours(0, 0, 0, 0);

        // If both dates are in the past or both are in the future, sort by date
        if (
          (dateA < today && dateB < today) ||
          (dateA >= today && dateB >= today)
        ) {
          return dateA.getTime() - dateB.getTime();
        }

        // Put future dates before past dates
        return dateB < today ? -1 : 1;
      });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getEventCategory = (date: string) => {
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    if (activeTab === "month") {
      if (eventDate.getTime() === today.getTime()) {
        return "Today";
      } else if (eventDate.getTime() === tomorrow.getTime()) {
        return "Tomorrow";
      } else if (eventDate < today) {
        return "Past Due";
      }

      // Calculate the difference in weeks
      const weekDiff = Math.floor(
        (eventDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );

      if (weekDiff === 0) {
        return "This Week";
      } else if (weekDiff === 1) {
        return "Next Week";
      } else {
        return `In ${weekDiff} Weeks`;
      }
    } else if (activeTab === "week") {
      // For week view, group by day name
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = dayNames[eventDate.getDay()];

      if (eventDate.getTime() === today.getTime()) {
        return "Today";
      } else if (eventDate.getTime() === tomorrow.getTime()) {
        return "Tomorrow";
      } else if (eventDate < today) {
        return "Past Due";
      } else {
        return dayName;
      }
    } else {
      // For "all" view
      if (eventDate.getTime() === today.getTime()) {
        return "Today";
      } else if (eventDate.getTime() === tomorrow.getTime()) {
        return "Tomorrow";
      } else if (eventDate < today) {
        return "Past Due";
      }

      // Calculate the difference in weeks
      const weekDiff = Math.floor(
        (eventDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );

      if (weekDiff === 0) {
        return "This Week";
      } else if (weekDiff === 1) {
        return "Next Week";
      } else if (weekDiff <= 4) {
        return "Later this month";
      } else {
        // For events beyond this month, show the month and year
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        return `${monthNames[eventDate.getMonth()]} ${eventDate.getFullYear()}`;
      }
    }
  };

  const filteredEvents = getFilteredEvents();

  // Group events by category
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const category = getEventCategory(event.date);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time,
      description: event.description,
      icon: event.icon,
    });
    setDialogState("edit");
  };

  const handleDeleteEvent = async (eventId: string) => {
    const updatedEvents = events.filter((event) => event.id !== eventId);
    setEvents(updatedEvents);

    try {
      if (isAuthenticated && userProfile?.cloud_sync_enabled) {
        // console.log("Deleting event from Supabase...");
        const { error } = await supabase
          .from("events")
          .delete()
          .eq("id", eventId)
          .eq("user_id", userProfile.id);

        if (error) throw error;
        // console.log("Event deleted from Supabase successfully");
      }
    } catch (error) {
      console.error("Error deleting event from Supabase:", error);
    }
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date) return;

    const event: Event = {
      id: crypto.randomUUID(),
      title: newEvent.title.trim(),
      date: newEvent.date,
      time: newEvent.time || "",
      description: newEvent.description.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...(newEvent.icon && { icon: newEvent.icon }),
    };

    setEvents([...events, event]);
    setNewEvent({
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      description: "",
    });

    try {
      if (isAuthenticated && userProfile?.cloud_sync_enabled) {
        // console.log("Adding event to Supabase...");
        const { error } = await supabase.from("events").insert([
          {
            id: event.id,
            user_id: userProfile.id,
            title: event.title,
            date: event.date,
            time: event.time,
            description: event.description,
            icon: event.icon,
            created_at: new Date(event.createdAt).toISOString(),
            updated_at: new Date(event.updatedAt).toISOString(),
          },
        ]);

        if (error) throw error;
        // console.log("Event added to Supabase successfully");
      }
    } catch (error) {
      console.error("Error adding event to Supabase:", error);
    }
    resetForm();
  };

  const resetForm = () => {
    setNewEvent({
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      description: "",
    });
    setEditingEvent(null);
    setDialogState("closed");
  };

  const handleEventBlur = async () => {
    try {
      // console.log("Event blur event triggered");
      await syncEventsOnBlur();
      // console.log("Events sync completed");
    } catch (error) {
      console.error("Error syncing events:", error);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !newEvent.title.trim() || !newEvent.date) return;

    const updatedEvent: Event = {
      ...editingEvent,
      title: newEvent.title.trim(),
      date: newEvent.date,
      time: newEvent.time || "",
      description: newEvent.description.trim(),
      updatedAt: Date.now(),
      icon: newEvent.icon,
    };

    const updatedEvents = events.map((event) =>
      event.id === editingEvent.id ? updatedEvent : event
    );
    setEvents(updatedEvents);
    resetForm();

    try {
      if (isAuthenticated && userProfile?.cloud_sync_enabled) {
        // console.log("Updating event in Supabase...");
        const { error } = await supabase
          .from("events")
          .update({
            title: updatedEvent.title,
            date: updatedEvent.date,
            time: updatedEvent.time,
            description: updatedEvent.description,
            icon: updatedEvent.icon,
            updated_at: new Date(updatedEvent.updatedAt).toISOString(),
          })
          .eq("id", updatedEvent.id)
          .eq("user_id", userProfile.id);

        if (error) throw error;
        // console.log("Event updated in Supabase successfully");
      }
    } catch (error) {
      console.error("Error updating event in Supabase:", error);
    }
  };

  // Function to fetch events from cloud
  const fetchCloudEvents = async () => {
    if (!isAuthenticated || !userProfile?.cloud_sync_enabled) return;

    try {
      // console.log("Fetching events from cloud...");
      const { data: cloudEvents, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", userProfile.id);

      if (error) throw error;

      if (cloudEvents) {
        // Convert cloud events to local format
        const cloudEventsFormatted = (cloudEvents as CloudEvent[]).map(
          (event) => ({
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            description: event.description,
            createdAt: new Date(event.created_at).getTime(),
            updatedAt: new Date(event.updated_at).getTime(),
          })
        );

        // console.log("Cloud events fetched:", cloudEventsFormatted.length);
        // console.log("Local events:", events.length);

        // Create a map of local events for easy lookup
        const localEventsMap = new Map<string, Event>();
        events.forEach((event) => {
          localEventsMap.set(event.id, event);
        });

        // Create a map of cloud events for easy lookup
        const cloudEventsMap = new Map<string, Event>();
        cloudEventsFormatted.forEach((event) => {
          cloudEventsMap.set(event.id, event);
        });

        // Create sets of IDs for comparison
        const localEventIds = new Set(events.map((event) => event.id));
        const cloudEventIds = new Set(
          cloudEventsFormatted.map((event) => event.id)
        );

        // Find events to delete (in cloud but not in local)
        const eventsToDelete = Array.from(cloudEventIds).filter(
          (id) => !localEventIds.has(id)
        );

        // Find events to add (in local but not in cloud)
        const eventsToAdd = Array.from(localEventIds).filter(
          (id) => !cloudEventIds.has(id)
        );

        // Find events that exist in both local and cloud
        const commonEventIds = Array.from(localEventIds).filter((id) =>
          cloudEventIds.has(id)
        );

        // Merge events, keeping the most recent version
        const mergedEvents: Event[] = [];

        // Add events that only exist locally
        eventsToAdd.forEach((id) => {
          const localEvent = localEventsMap.get(id);
          if (localEvent) {
            mergedEvents.push(localEvent);
          }
        });

        // Add events that only exist in cloud
        eventsToDelete.forEach((id) => {
          const cloudEvent = cloudEventsMap.get(id);
          if (cloudEvent) {
            mergedEvents.push(cloudEvent);
          }
        });

        // Compare and merge common events
        commonEventIds.forEach((id) => {
          const localEvent = localEventsMap.get(id);
          const cloudEvent = cloudEventsMap.get(id);

          if (localEvent && cloudEvent) {
            // Keep the event with the newer updatedAt timestamp
            if (localEvent.updatedAt >= cloudEvent.updatedAt) {
              mergedEvents.push(localEvent);
            } else {
              mergedEvents.push(cloudEvent);
            }
          }
        });

        // Sort events by updatedAt (most recent first)
        const sortedEvents = mergedEvents.sort(
          (a, b) => b.updatedAt - a.updatedAt
        );

        // Update local state with merged events
        setEvents(sortedEvents);

        // Update database with any changes
        const eventsToSync = sortedEvents
          .map((event) => {
            const cloudEvent = cloudEventsMap.get(event.id);

            // If event doesn't exist in cloud or local version is newer, sync to cloud
            if (
              !cloudEvent ||
              event.updatedAt > new Date(cloudEvent.updatedAt).getTime()
            ) {
              return {
                id: event.id,
                user_id: userProfile.id,
                title: event.title,
                date: event.date,
                time: event.time,
                description: event.description,
                created_at: new Date(event.createdAt).toISOString(),
                updated_at: new Date(event.updatedAt).toISOString(),
              };
            }
            return null;
          })
          .filter(Boolean) as CloudEvent[];

        if (eventsToSync.length > 0) {
          // console.log("Syncing", eventsToSync.length, "events to cloud...");
          const { error: syncError } = await supabase
            .from("events")
            .upsert(eventsToSync);

          if (syncError) throw syncError;
          // console.log("Events synced to cloud successfully");
        }

        // Delete events from cloud that don't exist locally
        if (eventsToDelete.length > 0) {
          // console.log(
            "Deleting",
            eventsToDelete.length,
            "events from cloud..."
          );
          const { error: deleteError } = await supabase
            .from("events")
            .delete()
            .in("id", eventsToDelete);

          if (deleteError) throw deleteError;
          // console.log("Events deleted from cloud successfully");
        }

        // console.log("Events sync completed successfully");
      }
    } catch (error) {
      console.error("Error fetching events from cloud:", error);
    }
  };

  // Set up periodic sync
  useEffect(() => {
    if (!isAuthenticated || !userProfile?.cloud_sync_enabled) return;

    // Initial fetch
    fetchCloudEvents();

    // Set up interval for periodic sync (every 30 seconds)
    const intervalId = setInterval(fetchCloudEvents, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [isAuthenticated, userProfile?.cloud_sync_enabled, userProfile?.id]);

  const toggleExpand = () => {
    setExpandedWidget(isExpanded ? null : "events");
  };

  const handleClickOutside = () => {
    // Don't collapse if dialog is open
    if (isExpanded) {
      if (dialogState === "closedFromOutSide") {
        setDialogState("closed");
        return;
      }

      setExpandedWidget(null);
    }
  };

  useClickOutside(eventsRef, handleClickOutside);

  // Calculate transform origin based on position
  const getTransformOrigin = () => {
    switch (widgetPositions.events) {
      case 1: // Top left
        return "top left";
      case 2: // Top right
        return "top right";
      case 3: // Bottom left
        return "bottom left";
      case 4: // Bottom right
        return "bottom right";
      default:
        return "center";
    }
  };

  // Handle Escape key press to close expanded widget
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setExpandedWidget(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded, setExpandedWidget]);

  // Emoji picker component
  const EmojiPicker = () => {
    const commonEmojis = [
      "😊",
      "🎉",
      "🎂",
      "🎁",
      "📅",
      "⏰",
      "📝",
      "📌",
      "🔔",
      "⭐",
      "❤️",
      "👍",
      "🎯",
      "🏆",
      "📚",
      "💼",
      "🏠",
      "✈️",
      "🎵",
      "🎮",
    ];

    return (
      <div className="grid grid-cols-5 gap-2 p-2 bg-black/20 dark:bg-black/40 rounded-lg border border-white/10">
        {commonEmojis.map((emoji, index) => (
          <button
            key={index}
            type="button"
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded transition-colors"
            onClick={() => {
              setNewEvent({ ...newEvent, icon: emoji });
              setIsEmojiPickerOpen(false);
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  };

  const { height, width } = useWindowSize();

  const getHeightByScreenSize = () => {
    if (height >= 1080) {
      return isExpanded ? "800px" : "400px";
    }
    if (height >= 768) {
      // screen height / 2
      return isExpanded ? height - 40 : height / 2 - 30;
    }
    if (height >= 480) {
      return isExpanded ? height - 80 : height / 2 - 30;
    }
    return isExpanded ? "300px" : "150px";
  };

  const getWidthByScreenSize = () => {
    if (height >= 1080) {
      return isExpanded ? "100%" : "100%";
    }
    return isExpanded ? "100%" : "100%";
  };

  return (
    <motion.div
      ref={eventsRef}
      layout
      initial={false}
      animate={{
        height: getHeightByScreenSize(),
        zIndex: isExpanded ? 50 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.4,
        bounce: 0,
        mass: 1,
      }}
      className={cn(
        "glass dark:glass-dark rounded-xl overflow-hidden text-white flex flex-col relative",
        isExpanded ? "mx-auto" : "w-full"
      )}
      style={{
        width: getWidthByScreenSize(),
        transformOrigin: getTransformOrigin(),
      }}
    >
      <motion.div
        layout="position"
        className="flex items-center justify-between p-4 border-b border-white/10"
        transition={{
          duration: 0.2,
          layout: {
            type: "spring",
            stiffness: 200,
            damping: 25,
            duration: 0.4,
            bounce: 0,
            mass: 1,
          },
        }}
      >
        <h2
          onClick={toggleExpand}
          className="text-xl select-none font-semibold flex items-center gap-2 cursor-pointer hover:text-white/80 transition-colors"
        >
          <CalendarDays className="h-5 w-5" />
          <span>Events</span>
        </h2>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setDialogState("create")}
                  className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                sideOffset={5} 
                className="z-[9999]"
              >
                <p>New event</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>

      <Dialog
        open={dialogState !== "closed" && dialogState !== "closedFromOutSide"}
        onOpenChange={(open) => !open && resetForm()}
      >
        <DialogContent
          onInteractOutside={(e) => {
            if (expandedWidget === "events") {
              e.preventDefault();
              setDialogState("closedFromOutSide");
              setExpandedWidget("events");
            }
          }}
          className="glass dark:glass-dark border-white/10 backdrop-blur-md shadow-xl"
        >
          <DialogHeader className="border-b border-white/10 pb-3">
            <DialogTitle className="text-white text-xl font-semibold flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {dialogState === "edit" ? "Edit Event" : "Create New Event"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={dialogState === "edit" ? handleSaveEdit : addEvent}
            className="space-y-5 mt-4"
          >
            <div className="mb-4">
              <label className="block text-sm mb-1.5 text-white/80 font-medium">
                Title
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= MAX_TITLE_LENGTH) {
                      setNewEvent({ ...newEvent, title: value });
                    }
                  }}
                  onBlur={handleEventBlur}
                  className="w-full bg-black/10 dark:bg-black/20 px-4 py-2.5 rounded-lg outline-none border border-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all duration-200 text-white placeholder-white/40 pl-12"
                  placeholder="Event title"
                  required
                />
                {newEvent.icon ? (
                  <button
                    type="button"
                    onClick={() =>
                      setNewEvent({ ...newEvent, icon: undefined })
                    }
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-6 h-6 text-white transition-colors rounded group"
                    title="Remove emoji"
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded transition-opacity">
                      <X className="h-3 w-3 text-white/90" />
                    </div>
                    <span className="text-lg">{newEvent.icon}</span>
                  </button>
                ) : (
                  <Popover
                    open={isEmojiPickerOpen}
                    onOpenChange={setIsEmojiPickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-6 h-6 text-white/50 hover:text-white/70 transition-colors"
                        title="Add emoji"
                      >
                        <Smile className="h-5 w-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 glass dark:glass-dark border-white/10"
                      align="start"
                    >
                      <EmojiPicker />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="text-xs text-white/50 mt-1.5 text-right">
                {newEvent.title.length}/{MAX_TITLE_LENGTH}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1.5 text-white/80 font-medium">
                Date
              </label>
              <Popover
                open={isDatePickerOpen}
                onOpenChange={setIsDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(true)}
                    className="w-full bg-black/10 dark:bg-black/20 px-4 py-2.5 rounded-lg outline-none border border-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all duration-200 flex items-center justify-between text-white"
                  >
                    {newEvent.date
                      ? format(new Date(newEvent.date), "PPP")
                      : "Pick a date"}
                    <CalendarIcon className="h-4 w-4 opacity-70" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 glass dark:glass-dark border-white/10"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={
                      newEvent.date ? new Date(newEvent.date) : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        const adjustedDate = new Date(date);
                        adjustedDate.setMinutes(
                          adjustedDate.getMinutes() -
                            adjustedDate.getTimezoneOffset()
                        );
                        setNewEvent({
                          ...newEvent,
                          date: adjustedDate.toISOString().split("T")[0],
                        });
                        setIsDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                    className="rounded-md border bg-background/80 dark:bg-black/80 backdrop-blur-md border-white/10 text-foreground dark:text-white"
                    classNames={{
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label:
                        "text-sm font-medium text-foreground dark:text-white",
                      nav: "space-x-1 flex items-center",
                      nav_button:
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-foreground dark:text-white",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      head_cell:
                        "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                      cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-foreground dark:text-white hover:bg-foreground/10 rounded-md transition-colors",
                      day_selected:
                        "bg-foreground/20 text-foreground dark:text-white hover:bg-foreground/30 rounded-md",
                      day_today:
                        "bg-foreground/10 text-foreground dark:text-white rounded-md",
                      day_outside: "text-muted-foreground opacity-50",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_range_middle:
                        "aria-selected:bg-foreground/20 aria-selected:text-foreground",
                      day_hidden: "invisible",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm mb-1.5 text-white/80 font-medium">
                Time (optional)
              </label>
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, time: e.target.value })
                }
                onBlur={handleEventBlur}
                className="w-full bg-black/10 dark:bg-black/20 px-4 py-2.5 rounded-lg outline-none border border-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all duration-200 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4"
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5 text-white/80 font-medium">
                Description
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= MAX_DESCRIPTION_LENGTH) {
                    setNewEvent({ ...newEvent, description: value });
                  }
                }}
                onBlur={handleEventBlur}
                className="w-full bg-black/10 dark:bg-black/20 px-4 py-2.5 rounded-lg outline-none border border-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all duration-200 text-white placeholder-white/40"
                placeholder="Event description"
                rows={3}
              />
              <div className="text-xs text-white/50 mt-1.5 text-right">
                {newEvent.description?.length || 0}/{MAX_DESCRIPTION_LENGTH}
              </div>
            </div>
            <DialogFooter className="border-t border-white/10 pt-4 mt-2">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
                >
                  {dialogState === "edit" ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <motion.div
        layout="position"
        className="p-4 flex-1 overflow-y-auto"
        transition={{
          duration: 0.2,
          layout: {
            type: "spring",
            stiffness: 200,
            damping: 25,
            duration: 0.4,
            bounce: 0,
            mass: 1,
          },
        }}
      >
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="grid grid-cols-3 mb-4 bg-black/20">
            <TabsTrigger
              value="all"
              className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20"
            >
              This Week
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20"
            >
              This Month
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value={activeTab}
            className="mt-0 flex-1 overflow-hidden"
          >
            {filteredEvents.length > 0 ? (
              <div className="space-y-4 h-full overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-white/20">
                {Object.entries(groupedEvents).map(([category, events]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-medium text-white/70 px-2 select-none">
                      {category}
                    </h3>
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 rounded-md bg-black/20 hover:bg-black/30 border border-white/10 transition-colors group cursor-pointer"
                        onClick={() => handleEditEvent(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white flex items-center gap-2">
                              {event.icon && (
                                <span className="text-xl shrink-0 text-white">
                                  {event.icon}
                                </span>
                              )}
                              <span className="truncate">{event.title}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-white/70 mt-1">
                              <div className="flex items-center gap-1 min-w-0">
                                <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">
                                  {formatDate(event.date)}
                                </span>
                              </div>
                              {event.time && (
                                <div className="flex items-center gap-1 ml-2">
                                  <Clock className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{event.time}</span>
                                </div>
                              )}
                            </div>
                            {event.description && (
                              <div
                                className={cn(
                                  "text-sm text-white/70 mt-2 break-words",
                                  !isExpanded && "line-clamp-2"
                                )}
                              >
                                {event.description}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-md transition-all text-white/50 hover:text-white shrink-0 ml-2"
                            title="Delete event"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-white/50">
                No events scheduled for this period
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default Events;
