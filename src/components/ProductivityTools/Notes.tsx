import React, { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useSettings } from '../../context/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { StickyNote, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface StoredNotes {
  value: Note[];
  timestamp: number;
}

const Notes: React.FC = () => {
  const { syncNotesOnBlur, isAuthenticated, userProfile, setTemporaryHideWidgets } = useSettings();
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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
        const localNotes = cloudNotes.map(note => ({
          id: note.id,
          content: note.content,
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
  
  // Set active note to the most recent note when component mounts
  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
      setActiveNoteId(sortedNotes[0].id);
      setNoteContent(sortedNotes[0].content);
    }
  }, [notes, activeNoteId]);
  
  // Focus textarea when active note changes
  useEffect(() => {
    if (activeNoteId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeNoteId]);
  
  const createNewNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
    setNoteContent('');
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  const deleteNote = async (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    if (activeNoteId === id) {
      if (notes.length > 1) {
        const remainingNotes = notes.filter(note => note.id !== id);
        const nextNote = remainingNotes[0];
        setActiveNoteId(nextNote.id);
        setNoteContent(nextNote.content);
      } else {
        setActiveNoteId(null);
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
      setNoteContent(selectedNote.content);
    }
  };
  
  const handleContentChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setNoteContent(content);
    
    if (activeNoteId) {
      const updatedNotes = notes.map(note => 
        note.id === activeNoteId 
          ? { ...note, content, updatedAt: Date.now() } 
          : note
      );
      
      setNotes(updatedNotes);
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
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    setTemporaryHideWidgets(newExpandedState);
  };

  // Cleanup temporary hide state on unmount
  useEffect(() => {
    return () => {
      setTemporaryHideWidgets(false);
    };
  }, []);

  // Sort notes by last updated, most recent first
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
  
  return (
    <motion.div
      layout
      initial={false}
      animate={{
        width: isExpanded ? '800px' : '100%',
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
        "glass dark:glass-dark rounded-xl text-white overflow-hidden flex flex-col relative",
        isExpanded ? "w-[800px]" : "w-full"
      )}
      style={{
        boxShadow: isExpanded ? '0 0 0 100vw rgba(0, 0, 0, 0.5)' : 'none',
        transformOrigin: 'center'
      }}
    >
      <motion.div 
        layout="position"
        className="flex items-center justify-between p-4 border-b border-white/10"
        transition={{ duration: 0.2 }}
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
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          layout="position"
          className="w-1/3 border-r border-white/10 overflow-y-auto"
          transition={{ duration: 0.2 }}
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
                className={`p-4 cursor-pointer hover:bg-white/5 ${
                  activeNoteId === note.id ? 'bg-white/10' : ''
                }`}
                transition={{ duration: 0.2 }}
              >
                <div className="text-sm text-white/70">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
                <div className="truncate">
                  {note.content || 'Empty note'}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        <motion.div 
          layout="position" 
          className="flex-1 p-4"
          transition={{ duration: 0.2 }}
        >
          {activeNoteId ? (
            <motion.textarea
              layout="position"
              ref={textareaRef}
              value={noteContent}
              onChange={handleContentChange}
              onBlur={handleBlur}
              className="w-full h-full bg-transparent outline-none resize-none"
              placeholder="Start typing..."
              transition={{ duration: 0.2 }}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center text-white/50"
              transition={{ duration: 0.2 }}
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
