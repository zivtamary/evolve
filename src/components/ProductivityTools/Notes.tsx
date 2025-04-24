import React, { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useSettings } from '../../context/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { StickyNote, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useClickOutside } from '../../hooks/use-click-outside';
import useWindowSize from '@/hooks/use-window-size';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';

// Maximum character limit for note content
const MAX_CONTENT_LENGTH = 5000;

interface CloudNote {
  id: string;
  title?: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface StoredNotes {
  value: Note[];
  timestamp: number;
}

const Notes: React.FC = () => {
  const { syncNotesOnBlur, isAuthenticated, userProfile, setExpandedWidget, expandedWidget, widgetPositions } = useSettings();
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [showCharLimitWarning, setShowCharLimitWarning] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const isExpanded = expandedWidget === 'notes';
  
  // Add state to track initial values when focusing
  const [initialTitle, setInitialTitle] = useState<string>('');
  const [initialContent, setInitialContent] = useState<string>('');
  
  // Function to fetch notes from cloud
  const fetchCloudNotes = async () => {
    if (!isAuthenticated || !userProfile?.cloud_sync_enabled) return;
    
    try {
      // console.log('Fetching notes from cloud...');
      const { data: cloudNotes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userProfile.id);
        
      if (error) throw error;
      
      if (cloudNotes) {
        // Convert cloud notes to local format
        const cloudNotesFormatted = (cloudNotes as CloudNote[]).map(note => ({
          id: note.id,
          title: note.title || 'Untitled Note',
          content: truncateContent(note.content), // Ensure content is within limit
          createdAt: new Date(note.created_at).getTime(),
          updatedAt: new Date(note.updated_at).getTime()
        }));
        
        // console.log('Cloud notes fetched:', cloudNotesFormatted.length);
        // console.log('Local notes:', notes.length);
        
        // Create a map of local notes for easy lookup
        const localNotesMap = new Map<string, Note>();
        notes.forEach(note => {
          localNotesMap.set(note.id, note);
        });
        
        // Create a map of cloud notes for easy lookup
        const cloudNotesMap = new Map<string, Note>();
        cloudNotesFormatted.forEach(note => {
          cloudNotesMap.set(note.id, note);
        });
        
        // Create sets of IDs for comparison
        const localNoteIds = new Set(notes.map(note => note.id));
        const cloudNoteIds = new Set(cloudNotesFormatted.map(note => note.id));
        
        // Find notes to delete (in cloud but not in local)
        const notesToDelete = Array.from(cloudNoteIds).filter(id => !localNoteIds.has(id));
        
        // Find notes to add (in local but not in cloud)
        const notesToAdd = Array.from(localNoteIds).filter(id => !cloudNoteIds.has(id));
        
        // Find notes that exist in both local and cloud
        const commonNoteIds = Array.from(localNoteIds).filter(id => cloudNoteIds.has(id));
        
        // Merge notes, keeping the most recent version
        const mergedNotes: Note[] = [];
        
        // Add notes that only exist locally
        notesToAdd.forEach(id => {
          const localNote = localNotesMap.get(id);
          if (localNote) {
            mergedNotes.push(localNote);
          }
        });
        
        // Add notes that only exist in cloud
        notesToDelete.forEach(id => {
          const cloudNote = cloudNotesMap.get(id);
          if (cloudNote) {
            mergedNotes.push(cloudNote);
          }
        });
        
        // Compare and merge common notes
        commonNoteIds.forEach(id => {
          const localNote = localNotesMap.get(id);
          const cloudNote = cloudNotesMap.get(id);
          
          if (localNote && cloudNote) {
            // Keep the note with the newer updatedAt timestamp
            if (localNote.updatedAt >= cloudNote.updatedAt) {
              mergedNotes.push(localNote);
            } else {
              mergedNotes.push(cloudNote);
            }
          }
        });
        
        // Sort notes by updatedAt (most recent first)
        const sortedNotes = mergedNotes.sort((a, b) => b.updatedAt - a.updatedAt);
        
        // Update local state with merged notes
        setNotes(sortedNotes);
        
        // Update database with any changes
        const notesToSync = sortedNotes.map(note => {
          const cloudNote = cloudNotesMap.get(note.id);
          
          // If note doesn't exist in cloud or local version is newer, sync to cloud
          if (!cloudNote || note.updatedAt > new Date(cloudNote.updatedAt).getTime()) {
            return {
              id: note.id,
              user_id: userProfile.id,
              title: note.title,
              content: note.content,
              created_at: new Date(note.createdAt).toISOString(),
              updated_at: new Date(note.updatedAt).toISOString()
            };
          }
          return null;
        }).filter(Boolean) as CloudNote[];
        
        if (notesToSync.length > 0) {
          // console.log('Syncing', notesToSync.length, 'notes to cloud...');
          const { error: syncError } = await supabase
            .from('notes')
            .upsert(notesToSync);
            
          if (syncError) throw syncError;
          // console.log('Notes synced to cloud successfully');
        }
        
        // Delete notes from cloud that don't exist locally
        if (notesToDelete.length > 0) {
          // console.log('Deleting', notesToDelete.length, 'notes from cloud...');
          const { error: deleteError } = await supabase
            .from('notes')
            .delete()
            .in('id', notesToDelete);
            
          if (deleteError) throw deleteError;
          // console.log('Notes deleted from cloud successfully');
        }
        
        // console.log('Notes sync completed successfully');
      }
    } catch (error) {
      console.error('Error fetching notes from cloud:', error);
    }
  };

  // Set up periodic sync
  useEffect(() => {
    if (!isAuthenticated || !userProfile?.cloud_sync_enabled) return;

    // Initial fetch
    fetchCloudNotes();

    // Set up interval for periodic sync (every 30 seconds)
    const intervalId = setInterval(fetchCloudNotes, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [isAuthenticated, userProfile?.cloud_sync_enabled, userProfile?.id]);
  
  // Validate notes from localStorage on initial load
  useEffect(() => {
    if (notes.length > 0) {
      const validatedNotes = notes.map(note => ({
        ...note,
        content: truncateContent(note.content)
      }));
      
      // Only update if changes were made
      if (JSON.stringify(validatedNotes) !== JSON.stringify(notes)) {
        setNotes(validatedNotes);
      }
    }
  }, []);
  
  // Set active note to the most recent note when component mounts
  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
      setActiveNoteId(sortedNotes[0].id);
      setNoteTitle(sortedNotes[0].title);
      setNoteContent(sortedNotes[0].content);
    }
  }, [notes, activeNoteId]);
  
  // Focus textarea when active note changes
  useEffect(() => {
    if (activeNoteId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeNoteId]);
  
  // Helper function to truncate content to max length
  const truncateContent = (content: string): string => {
    if (content.length <= MAX_CONTENT_LENGTH) return content;
    return content.substring(0, MAX_CONTENT_LENGTH);
  };
  
  const createNewNote = async () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
    setNoteTitle('Untitled Note');
    setNoteContent('');
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    
    // Immediately create the note in the database if authenticated and sync is enabled
    if (isAuthenticated && userProfile?.cloud_sync_enabled) {
      try {
        // console.log('Creating new note in database:', newNote.id);
        const { error } = await supabase
          .from('notes')
          .insert({
            id: newNote.id,
            user_id: userProfile.id,
            title: newNote.title,
            content: newNote.content,
            created_at: new Date(newNote.createdAt).toISOString(),
            updated_at: new Date(newNote.updatedAt).toISOString()
          });
          
        if (error) throw error;
        // console.log('Note created in database successfully');
      } catch (error) {
        console.error('Error creating note in database:', error);
      }
    }
  };
  
  const deleteNote = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    if (activeNoteId === id) {
      if (notes.length > 1) {
        const remainingNotes = notes.filter(note => note.id !== id);
        const nextNote = remainingNotes[0];
        setActiveNoteId(nextNote.id);
        setNoteTitle(nextNote.title);
        setNoteContent(nextNote.content);
      } else {
        setActiveNoteId(null);
        setNoteTitle('');
        setNoteContent('');
      }
    }

    try {
      // console.log('Note deleted, attempting to sync...');
      
      // Directly delete from database if authenticated and sync is enabled
      if (isAuthenticated && userProfile?.cloud_sync_enabled) {
        // console.log('Deleting note from database:', id);
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', id)
          .eq('user_id', userProfile.id);
          
        if (error) throw error;
        // console.log('Note deleted from database successfully');
      } else {
        // If not authenticated or sync disabled, just sync normally
        await syncNotesOnBlur();
      }
      
      // console.log('Notes sync completed');
    } catch (error) {
      console.error('Error syncing notes:', error);
    }
  };
  
  const selectNote = (id: string) => {
    if (id === activeNoteId) return;
    
    const selectedNote = notes.find(note => note.id === id);
    if (selectedNote) {
      setActiveNoteId(id);
      setNoteTitle(selectedNote.title);
      setNoteContent(selectedNote.content);
    }
  };
  
  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setNoteTitle(title);
    
    if (activeNoteId) {
      const updatedNotes = notes.map(note => 
        note.id === activeNoteId 
          ? { ...note, title, updatedAt: Date.now() } 
          : note
      );
      
      setNotes(updatedNotes);
    }
  };

  const handleTitleFocus = () => {
    // Store the initial title value when focusing
    setInitialTitle(noteTitle);
  };
  
  const handleContentFocus = () => {
    // Store the initial content value when focusing
    setInitialContent(noteContent);
  };

  // Add a new function to handle title blur
  const handleTitleBlur = async () => {
    try {
      // console.log('Note title blur event triggered');
      // console.log('Initial title:', initialTitle);
      // console.log('Current title:', noteTitle);
      
      // If we have an active note and are authenticated with sync enabled, update it directly
      if (activeNoteId && isAuthenticated && userProfile?.cloud_sync_enabled) {
        const activeNote = notes.find(note => note.id === activeNoteId);
        if (activeNote) {
          // Check if the title has actually changed
          if (initialTitle !== noteTitle) {
            // console.log('Title changed, updating note title in database:', activeNoteId);
            const { error } = await supabase
              .from('notes')
              .update({
                title: noteTitle,
                updated_at: new Date().toISOString()
              })
              .eq('id', activeNoteId)
              .eq('user_id', userProfile.id);
              
            if (error) throw error;
            // console.log('Note title updated in database successfully');
            
            // Update last_synced timestamp in profile
            await updateLastSynced();
          } else {
            // console.log('No title changes detected, skipping database update');
          }
        }
      } else {
        // If not authenticated or sync disabled, just sync normally
        await syncNotesOnBlur();
      }
      
      // Clear the initial title value
      setInitialTitle('');
      
      // console.log('Notes sync completed');
    } catch (error) {
      console.error('Error syncing notes:', error);
    }
  };

  const handleContentChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    
    // Check if content exceeds the limit
    if (content.length > MAX_CONTENT_LENGTH) {
      setShowCharLimitWarning(true);
      // Truncate the content to the maximum length
      const truncatedContent = content.substring(0, MAX_CONTENT_LENGTH);
      setNoteContent(truncatedContent);
      
      if (activeNoteId) {
        const updatedNotes = notes.map(note => 
          note.id === activeNoteId 
            ? { ...note, content: truncatedContent, updatedAt: Date.now() } 
            : note
        );
        
        setNotes(updatedNotes);
      }
    } else {
      setShowCharLimitWarning(false);
      setNoteContent(content);
      
      if (activeNoteId) {
        const updatedNotes = notes.map(note => 
          note.id === activeNoteId 
            ? { ...note, content, updatedAt: Date.now() } 
            : note
        );
        
        setNotes(updatedNotes);
      }
    }
  };

  const handleBlur = async () => {
    try {
      // console.log('Note blur event triggered');
      // console.log('Initial content:', initialContent);
      // console.log('Current content:', noteContent);
      
      // If we have an active note and are authenticated with sync enabled, update it directly
      if (activeNoteId && isAuthenticated && userProfile?.cloud_sync_enabled) {
        const activeNote = notes.find(note => note.id === activeNoteId);
        if (activeNote) {
          // Check if the content has actually changed
          if (initialContent !== noteContent) {
            // console.log('Content changed, updating note in database:', activeNoteId);
            const { error } = await supabase
              .from('notes')
              .update({
                content: noteContent,
                updated_at: new Date().toISOString()
              })
              .eq('id', activeNoteId)
              .eq('user_id', userProfile.id);
              
            if (error) throw error;
            // console.log('Note content updated in database successfully');
            
            // Update last_synced timestamp in profile
            await updateLastSynced();
          } else {
            // console.log('No content changes detected, skipping database update');
          }
        }
      } else {
        // If not authenticated or sync disabled, just sync normally
        await syncNotesOnBlur();
      }
      
      // Clear the initial content value
      setInitialContent('');
      
      // console.log('Notes sync completed');
    } catch (error) {
      console.error('Error syncing notes:', error);
    }
  };
  
  // Add a helper function to update the last_synced timestamp
  const updateLastSynced = async () => {
    if (!isAuthenticated || !userProfile?.id) return;
    
    try {
      // console.log('Updating last_synced timestamp in profile');
      const { error } = await supabase
        .from('profiles')
        .update({ last_synced: new Date().toISOString() })
        .eq('id', userProfile.id);
        
      if (error) throw error;
      // console.log('Last synced timestamp updated successfully');
    } catch (error) {
      console.error('Error updating last_synced timestamp:', error);
    }
  };
  
  const toggleExpand = () => {
    setExpandedWidget(isExpanded ? null : 'notes');
  };

  // Cleanup expanded state on unmount
  useEffect(() => {
    return () => {
      if (isExpanded) {
        setExpandedWidget(null);
      }
    };
  }, [isExpanded, setExpandedWidget]);

  // Sort notes by last updated, most recent first
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
  
  // Calculate transform origin based on position
  const getTransformOrigin = () => {
    switch (widgetPositions.notes) {
      case 1: // Top left
        return 'top left';
      case 2: // Top right
        return 'top right';
      case 3: // Bottom left
        return 'bottom left';
      case 4: // Bottom right
        return 'bottom right';
      default:
        return 'center';
    }
  };

  const handleClickOutside = () => {
    if (isExpanded) {
      setExpandedWidget(null);
    }
  };

  useClickOutside(notesRef, handleClickOutside);

  // Handle Escape key press to close expanded widget
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setExpandedWidget(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, setExpandedWidget]);
  const { width, height } = useWindowSize();

  const getHeightByScreenSize = () => {
    if (height >= 1080) {
      return isExpanded ? '800px' : '400px';
    };
    if (height >= 768) {
        // screen height / 2
      return isExpanded ? height - 40 : height / 2 - 30;
    };
    if (height >= 480) {
      return isExpanded ? height - 80 : height / 2 - 30;
    };
    return isExpanded ? '300px' : '150px';
  };

  const getWidthByScreenSize = () => {
    if (height >= 1080) {
      return isExpanded ? '800px' : '100%';
    };
    return isExpanded ? '100%' : '100%';
  };


  return (
    <motion.div
      ref={notesRef}
      layout
      initial={false}
      animate={{
        height: getHeightByScreenSize(),
        zIndex: isExpanded ? 50 : 1
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.4,
        bounce: 0,
        mass: 1
      }}
      className={cn(
        "glass dark:glass-dark rounded-xl overflow-hidden text-white flex flex-col relative notes-component",
        isExpanded ? "mx-auto" : "w-full"
      )}
      style={{
        width: getWidthByScreenSize(),
        transformOrigin: getTransformOrigin()
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
            mass: 1
          }
        }}
      >
        <h2 
          onClick={toggleExpand}
          className="text-xl select-none font-semibold flex items-center gap-2 cursor-pointer hover:text-white/80 transition-colors"
        >
          <StickyNote className="h-5 w-5" />
          <span>Notes</span>
        </h2>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={createNewNote}
                  className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          </TooltipTrigger>
          <TooltipContent>
            Create a new note
          </TooltipContent>
        </Tooltip>
        </TooltipProvider>
        </div>
      </motion.div>
      
      <motion.div 
        layout="position" 
        className="flex-1 overflow-hidden flex"
        transition={{ 
          duration: 0.2,
          layout: {
            type: "spring",
            stiffness: 200,
            damping: 25,
            duration: 0.4,
            bounce: 0,
            mass: 1
          }
        }}
      >
        <motion.div 
          layout="position"
          className="w-1/3 border-r border-white/10 overflow-y-auto note-list"
          transition={{ 
            duration: 0.2,
            layout: {
              type: "spring",
              stiffness: 200,
              damping: 25,
              duration: 0.4,
              bounce: 0,
              mass: 1
            }
          }}
        >
          <AnimatePresence mode="wait">
            {sortedNotes.map(note => (
              <motion.div
                key={note.id}
                layout="position"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onClick={() => selectNote(note.id)}
                className={`p-4 cursor-pointer hover:bg-white/5 group relative h-[4.5rem] ${
                  activeNoteId === note.id ? 'bg-white/10' : ''
                }`}
                transition={{ 
                  duration: 0.2,
                  layout: {
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                    duration: 0.4,
                    bounce: 0,
                    mass: 1
                  }
                }}
              >
                <div className="flex flex-col">
                  <div className="text-sm text-white/70">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="font-medium text-white truncate">
                    {note.title || note.content || 'Untitled Note'}
                  </div>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => deleteNote(note.id, e)}
                    className="text-white/50 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all duration-200"
                    title="Delete note"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        <motion.div 
          layout="position" 
          className="flex-1 p-4 note-content"
          transition={{ 
            duration: 0.2,
            layout: {
              type: "spring",
              stiffness: 200,
              damping: 25,
              duration: 0.4,
              bounce: 0,
              mass: 1
            }
          }}
        >
          {activeNoteId ? (
            <motion.div
              layout="position"
              className="flex flex-col h-full gap-4 opacity-[100!important]"
            >
              <motion.input
                layout="position"
                type="text"
                value={noteTitle}
                onChange={handleTitleChange}
                onFocus={handleTitleFocus}
                onBlur={handleTitleBlur}
                className="w-full bg-transparent outline-none text-xl font-semibold text-white placeholder:text-white/60"
                placeholder="Note title..."
              />
              <div className="flex flex-col flex-1">
                <motion.textarea
                  layout="position"
                  ref={textareaRef}
                  value={noteContent}
                  onChange={handleContentChange}
                  onFocus={handleContentFocus}
                  onBlur={handleBlur}
                  className="w-full flex-1 bg-transparent outline-none resize-none text-base text-white placeholder:text-white/60"
                  placeholder="Start typing..."
                  transition={{ 
                    duration: 0.2,
                    layout: {
                      type: "spring",
                      stiffness: 200,
                      damping: 25,
                      duration: 0.4,
                      bounce: 0,
                      mass: 1
                    }
                  }}
                />
                <div className="flex justify-between items-center mt-2 text-xs text-white/50">
                  <AnimatePresence>
                    {showCharLimitWarning && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center gap-1 text-amber-400"
                      >
                        <AlertCircle className="h-3 w-3" />
                        <span>Character limit reached ({MAX_CONTENT_LENGTH})</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div>
                    {noteContent.length}/{MAX_CONTENT_LENGTH}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center text-white/50"
              transition={{ 
                duration: 0.2,
                layout: {
                  type: "spring",
                  stiffness: 200,
                  damping: 25,
                  duration: 0.4,
                  bounce: 0,
                  mass: 1
                }
              }}
            >
              Select a note or create a new one
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Notes;
