import React, { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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
      id: Date.now().toString(),
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setNoteContent('');
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    
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
  };
  
  const selectNote = (id: string) => {
    if (id === activeNoteId) return;
    
    const selectedNote = notes.find(note => note.id === id);
    if (selectedNote) {
      setActiveNoteId(id);
      setNoteContent(selectedNote.content);
    }
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
  
  // Sort notes by last updated, most recent first
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
  
  return (
    <div className="glass dark:glass-dark rounded-xl text-white overflow-hidden h-[400px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold">Notes</h2>
        <button
          onClick={createNewNote}
          className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
          title="New note"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Notes list */}
        <div className="w-1/3 border-r border-white/10 overflow-y-auto">
          {sortedNotes.length === 0 ? (
            <div className="p-4 text-white/50 text-center">
              <p>No notes yet</p>
              <button
                onClick={createNewNote}
                className="mt-2 text-white/70 hover:text-white underline"
              >
                Create one
              </button>
            </div>
          ) : (
            <ul>
              {sortedNotes.map(note => (
                <li 
                  key={note.id}
                  className={`
                    p-3 cursor-pointer border-b border-white/10 hover:bg-white/5
                    ${activeNoteId === note.id ? 'bg-white/10' : ''}
                  `}
                  onClick={() => selectNote(note.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      {note.content ? (
                        <span className="text-sm">{note.content.split('\n')[0] || 'Empty note'}</span>
                      ) : (
                        <span className="text-white/50 text-sm">Empty note</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="text-white/50 hover:text-white/90 ml-2"
                      title="Delete note"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Note editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeNoteId ? (
            <textarea
              ref={textareaRef}
              value={noteContent}
              onChange={handleContentChange}
              placeholder="Type your note here..."
              className="flex-1 bg-transparent p-4 outline-none resize-none placeholder:text-white/50"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-white/50 text-center">
                <p>Select a note or create a new one</p>
                <button
                  onClick={createNewNote}
                  className="mt-2 px-4 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Create Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
