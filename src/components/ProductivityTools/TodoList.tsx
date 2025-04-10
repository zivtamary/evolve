import React, { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useSettings } from '../../context/SettingsContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, CheckSquare, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useClickOutside } from '../../hooks/use-click-outside';

// Maximum character limit for todo items
const TODO_CHAR_LIMIT = 100;

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface StoredTodos {
  value: TodoItem[];
  timestamp: number;
}

const TodoList: React.FC = () => {
  const { syncTodosOnBlur, isAuthenticated, userProfile, setExpandedWidget, expandedWidget, widgetPositions } = useSettings();
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('todos', []);
  const [newTodo, setNewTodo] = useState('');
  const [charCount, setCharCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const todoListRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const isExpanded = expandedWidget === 'todoList';
  
  // Function to fetch todos from cloud
  const fetchCloudTodos = async () => {
    if (!isAuthenticated || !userProfile?.cloud_sync_enabled) return;
    
    try {
      console.log('Fetching todos from cloud...');
      const { data: cloudTodos, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userProfile.id);
        
      if (error) throw error;
      
      if (cloudTodos) {
        const localTodos = cloudTodos.map(todo => ({
          id: todo.id,
          text: todo.title,
          completed: todo.completed,
          createdAt: new Date(todo.created_at).getTime()
        }));
        setTodos(localTodos);
        console.log('Local todos updated with cloud data');
      }
    } catch (error) {
      console.error('Error fetching todos from cloud:', error);
    }
  };

  // Set up periodic sync
  useEffect(() => {
    if (!isAuthenticated || !userProfile?.cloud_sync_enabled) return;

    // Initial fetch
    fetchCloudTodos();

    // Set up interval for periodic sync (every 30 seconds)
    const intervalId = setInterval(fetchCloudTodos, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [isAuthenticated, userProfile?.cloud_sync_enabled, userProfile?.id]);

  // Update character count when newTodo changes
  useEffect(() => {
    setCharCount(newTodo.length);
  }, [newTodo]);

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

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    // Ensure the todo text doesn't exceed the character limit
    const todoText = newTodo.trim().substring(0, TODO_CHAR_LIMIT);

    const todo: TodoItem = {
      id: crypto.randomUUID(),
      text: todoText,
      completed: false,
      createdAt: Date.now()
    };

    setTodos([...todos, todo]);
    setNewTodo('');

    try {
      console.log('Todo added, attempting to sync...');
      await syncTodosOnBlur();
      console.log('Todos sync completed');
    } catch (error) {
      console.error('Error syncing todos:', error);
    }
  };
  
  const toggleTodo = async (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);

    try {
      console.log('Todo toggled, attempting to sync...');
      await syncTodosOnBlur();
      console.log('Todos sync completed');
    } catch (error) {
      console.error('Error syncing todos:', error);
    }
  };
  
  const deleteTodo = async (id: string) => {
    try {
      // First delete from Supabase if authenticated and sync is enabled
      if (isAuthenticated && userProfile?.cloud_sync_enabled) {
        console.log('Deleting todo from cloud:', id);
        const { error } = await supabase
          .from('todos')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        console.log('Todo deleted from cloud successfully');

        // After successful delete, fetch updated todos
        console.log('Fetching updated todos...');
        const { data: updatedTodos, error: fetchError } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', userProfile.id);
          
        if (fetchError) throw fetchError;
        
        // Update local storage with fetched todos
        if (updatedTodos) {
          const localTodos = updatedTodos.map(todo => ({
            id: todo.id,
            text: todo.title,
            completed: todo.completed,
            createdAt: new Date(todo.created_at).getTime()
          }));
          setTodos(localTodos);
          console.log('Local todos updated with cloud data');
        }
      } else {
        // If not authenticated or sync disabled, just update local storage
        const updatedTodos = todos.filter(todo => todo.id !== id);
        setTodos(updatedTodos);
        console.log('Todo deleted from local storage only');
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };
  
  // Get filtered todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  const toggleExpand = () => {
    setExpandedWidget(isExpanded ? null : 'todoList');
  };

  const handleClickOutside = () => {
    if (isExpanded) {
      setExpandedWidget(null);
    }
  };

  useClickOutside(todoListRef, handleClickOutside);

  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  
  // Calculate transform origin based on position
  const getTransformOrigin = () => {
    switch (widgetPositions.todoList) {
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

  return (
    <motion.div
      ref={todoListRef}
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
        "glass dark:glass-dark rounded-xl text-white overflow-hidden flex flex-col relative",
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
          <CheckSquare className="h-5 w-5" />
          <span>Todo List</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="text-xs text-white/70">
            {activeTodosCount} items left
          </div>
        </div>
      </motion.div>
      
      <motion.form 
        layout="position"
        onSubmit={addTodo} 
        className="p-4 border-b border-white/10"
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
          <div className="flex">
            <input
              ref={inputRef}
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-grow bg-black/20 px-4 py-2 rounded-l outline-none placeholder:text-white/50"
              maxLength={TODO_CHAR_LIMIT}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-r text-white transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${charCount >= TODO_CHAR_LIMIT ? 'text-red-400' : 'text-white/50'}`}>
              {charCount}/{TODO_CHAR_LIMIT} characters
            </span>
          </div>
        </div>
      </motion.form>
      
      <motion.div 
        layout="position"
        className="flex-1 overflow-hidden flex flex-col"
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
          className="flex-1 overflow-y-auto"
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
          {filteredTodos.length === 0 ? (
            <motion.div 
              layout="position"
              className="p-4 text-center text-white/50"
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
              {filter === 'all' 
                ? 'No todos yet. Add one above!' 
                : filter === 'active' 
                  ? 'No active todos' 
                  : 'No completed todos'}
            </motion.div>
          ) : (
            <motion.ul layout="position">
              <AnimatePresence mode="wait">
                {filteredTodos.map(todo => (
                  <motion.li 
                    key={todo.id}
                    layout="position"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center px-4 py-3 border-b border-white/10 group hover:bg-white/5 transition-colors"
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
                    <div className="flex items-center flex-1 gap-3">
                      <Checkbox
                        id={todo.id}
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo.id)}
                        className="h-5 w-5 border-white/30 bg-white/10 hover:bg-white/20 data-[state=checked]:bg-white/20 data-[state=checked]:text-white transition-colors"
                      >
                        <Check className="h-4 w-4" />
                      </Checkbox>
                      <label 
                        htmlFor={todo.id}
                        className={`flex-1 cursor-pointer transition-all duration-200 ${
                          todo.completed 
                            ? 'line-through text-white/50' 
                            : 'hover:text-white'
                        }`}
                      >
                        {todo.text}
                      </label>
                    </div>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-white ml-2 p-1 rounded-md hover:bg-white/10 transition-all duration-200"
                      title="Delete todo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </motion.div>
        
        <motion.div 
          layout="position"
          className="p-4 border-t border-white/10"
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
          <div className="flex space-x-2 text-sm mb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded ${filter === 'all' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-2 py-1 rounded ${filter === 'active' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2 py-1 rounded ${filter === 'completed' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              Completed
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default TodoList;
