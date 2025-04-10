import React, { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useSettings } from '../../context/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { StickyNote, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useClickOutside } from '../../hooks/use-click-outside';

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
  
  // Function to fetch notes from cloud
  const fetchCloudNotes = async () => {
    if (!isAuthenticated || !userProfile?.cloud_sync_enabled) return;
    
    try {
      console.log('Fetching notes from cloud...');
      const { data: cloudNotes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userProfile.id);
        
      if (error) throw error;
      
      if (cloudNotes) {
        const localNotes = (cloudNotes as CloudNote[]).map(note => ({
          id: note.id,
          title: note.title || 'Untitled Note',
          content: truncateContent(note.content), // Ensure content is within limit
          createdAt: new Date(note.created_at).getTime(),
          updatedAt: new Date(note.updated_at).getTime()
        }));
        setNotes(localNotes);
        console.log('Local notes updated with cloud data');
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
  
  const createNewNote = () => {
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
      console.log('Note deleted, attempting to sync...');
      await syncNotesOnBlur();
      console.log('Notes sync completed');
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
      console.log('Note blur event triggered');
      await syncNotesOnBlur();
      console.log('Notes sync completed');
    } catch (error) {
      console.error('Error syncing notes:', error);
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

  return (
    <motion.div
      ref={notesRef}
      layout
      initial={false}
      animate={{
        height: isExpanded ? '800px' : '400px',
        zIndex: isExpanded ? 50 : 0,
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
        "glass dark:glass-dark rounded-xl text-white overflow-hidden flex flex-col relative notes-component",
        isExpanded ? "mx-auto" : "w-full"
      )}
      style={{
        width: isExpanded ? '800px' : '100%',
        boxShadow: isExpanded ? '0 0 0 100vw rgba(0, 0, 0, 0.5)' : 'none',
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
          className="text-xl font-semibold flex items-center gap-2 cursor-pointer hover:text-white/80 transition-colors"
        >
          <StickyNote className="h-5 w-5" />
          <span>Notes</span>
        </h2>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {isExpanded && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={toggleExpand}
                className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
          <button
            onClick={createNewNote}
            className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
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
                className="w-full bg-transparent outline-none text-xl font-semibold text-white placeholder:text-white/60"
                placeholder="Note title..."
              />
              <div className="flex flex-col flex-1">
                <motion.textarea
                  layout="position"
                  ref={textareaRef}
                  value={noteContent}
                  onChange={handleContentChange}
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
