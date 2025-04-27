import React, { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useSettings } from '../../context/SettingsContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, CheckSquare, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useClickOutside } from '../../hooks/use-click-outside';
import useWindowSize from '@/hooks/use-window-size';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useLanguage } from '@/context/LanguageContext';

// Maximum character limit for todo items
const TODO_CHAR_LIMIT = 100;

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

interface CloudTodo {
  id: string;
  title: string;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
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
  const isExpanded = expandedWidget === "todoList";

  const { t } = useLanguage();

  // Function to fetch todos from cloud
  const fetchCloudTodos = async () => {
    if (!isAuthenticated || !userProfile?.cloud_sync_enabled) return;
    
    try {
      // console.log('Fetching todos from cloud...');
      const { data: cloudTodos, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userProfile.id);
        
      if (error) throw error;
      
      if (cloudTodos) {
        // Convert cloud todos to local format
        const cloudTodosFormatted = (cloudTodos as CloudTodo[]).map(todo => ({
          id: todo.id,
          text: todo.title,
          completed: todo.completed,
          createdAt: new Date(todo.created_at).getTime(),
          updatedAt: new Date(todo.updated_at).getTime()
        }));
        
        // console.log('Cloud todos fetched:', cloudTodosFormatted.length);
        // console.log('Local todos:', todos.length);
        
        // Create a map of local todos for easy lookup
        const localTodosMap = new Map<string, TodoItem>();
        todos.forEach(todo => {
          localTodosMap.set(todo.id, todo);
        });
        
        // Create a map of cloud todos for easy lookup
        const cloudTodosMap = new Map<string, TodoItem>();
        cloudTodosFormatted.forEach(todo => {
          cloudTodosMap.set(todo.id, todo);
        });
        
        // Create sets of IDs for comparison
        const localTodoIds = new Set(todos.map(todo => todo.id));
        const cloudTodoIds = new Set(cloudTodosFormatted.map(todo => todo.id));
        
        // Find todos to delete (in cloud but not in local)
        const todosToDelete = Array.from(cloudTodoIds).filter(id => !localTodoIds.has(id));
        
        // Find todos to add (in local but not in cloud)
        const todosToAdd = Array.from(localTodoIds).filter(id => !cloudTodoIds.has(id));
        
        // Find todos that exist in both local and cloud
        const commonTodoIds = Array.from(localTodoIds).filter(id => cloudTodoIds.has(id));
        
        // Merge todos, keeping the most recent version
        const mergedTodos: TodoItem[] = [];
        
        // Add todos that only exist locally
        todosToAdd.forEach(id => {
          const localTodo = localTodosMap.get(id);
          if (localTodo) {
            mergedTodos.push(localTodo);
          }
        });
        
        // Add todos that only exist in cloud
        todosToDelete.forEach(id => {
          const cloudTodo = cloudTodosMap.get(id);
          if (cloudTodo) {
            mergedTodos.push(cloudTodo);
          }
        });
        
        // Compare and merge common todos
        commonTodoIds.forEach(id => {
          const localTodo = localTodosMap.get(id);
          const cloudTodo = cloudTodosMap.get(id);
          
          if (localTodo && cloudTodo) {
            // Keep the todo with the newer updatedAt timestamp
            if (localTodo.updatedAt >= cloudTodo.updatedAt) {
              mergedTodos.push(localTodo);
            } else {
              mergedTodos.push(cloudTodo);
            }
          }
        });
        
        // Sort todos by updatedAt (most recent first)
        const sortedTodos = mergedTodos.sort((a, b) => b.updatedAt - a.updatedAt);
        
        // Update local state with merged todos
        setTodos(sortedTodos);
        
        // Update database with any changes
        const todosToSync = sortedTodos.map(todo => {
          const cloudTodo = cloudTodosMap.get(todo.id);
          
          // If todo doesn't exist in cloud or local version is newer, sync to cloud
          if (!cloudTodo || todo.updatedAt > new Date(cloudTodo.updatedAt).getTime()) {
            return {
              id: todo.id,
              user_id: userProfile.id,
              title: todo.text,
              completed: todo.completed,
              created_at: new Date(todo.createdAt).toISOString(),
              updated_at: new Date(todo.updatedAt).toISOString()
            };
          }
          return null;
        }).filter(Boolean) as CloudTodo[];
        
        if (todosToSync.length > 0) {
          // console.log('Syncing', todosToSync.length, 'todos to cloud...');
          const { error: syncError } = await supabase
            .from('todos')
            .upsert(todosToSync);
            
          if (syncError) throw syncError;
          // console.log('Todos synced to cloud successfully');
        }
        
        // Delete todos from cloud that don't exist locally
        if (todosToDelete.length > 0) {
          // console.log('Deleting', todosToDelete.length, 'todos from cloud...');
          const { error: deleteError } = await supabase
            .from('todos')
            .delete()
            .in('id', todosToDelete);
            
          if (deleteError) throw deleteError;
          // console.log('Todos deleted from cloud successfully');
        }
        
        // console.log('Todos sync completed successfully');
      }
    } catch (error) {
      // console.error('Error fetching todos from cloud:', error);
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
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setTodos([...todos, todo]);
    setNewTodo('');

    try {
      // console.log('Todo added, attempting to sync...');
      
      // Directly insert into database if authenticated and sync is enabled
      if (isAuthenticated && userProfile?.cloud_sync_enabled) {
        // console.log('Inserting todo into database:', todo.id);
        const { error } = await supabase
          .from('todos')
          .insert({
            id: todo.id,
            user_id: userProfile.id,
            title: todo.text,
            completed: todo.completed,
            created_at: new Date(todo.createdAt).toISOString(),
            updated_at: new Date(todo.updatedAt).toISOString()
          });
          
        if (error) throw error;
        // console.log('Todo inserted into database successfully');
        
        // Update last_synced timestamp in profile
        await updateLastSynced();
      } else {
        // If not authenticated or sync disabled, just sync normally
        await syncTodosOnBlur();
      }
      
      // console.log('Todos sync completed');
    } catch (error) {
      // console.error('Error syncing todos:', error);
    }
  };
  
  const toggleTodo = async (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: Date.now() } : todo
    );
    setTodos(updatedTodos);

    try {
      // console.log('Todo toggled, attempting to sync...');
      
      // Directly update in database if authenticated and sync is enabled
      if (isAuthenticated && userProfile?.cloud_sync_enabled) {
        const todo = updatedTodos.find(t => t.id === id);
        if (todo) {
          // console.log('Updating todo in database:', id);
          const { error } = await supabase
            .from('todos')
            .update({
              completed: todo.completed,
              updated_at: new Date(todo.updatedAt).toISOString()
            })
            .eq('id', id)
            .eq('user_id', userProfile.id);
            
          if (error) throw error;
          // console.log('Todo updated in database successfully');
          
          // Update last_synced timestamp in profile
          await updateLastSynced();
        }
      } else {
        // If not authenticated or sync disabled, just sync normally
        await syncTodosOnBlur();
      }
      
      // console.log('Todos sync completed');
    } catch (error) {
      // console.error('Error syncing todos:', error);
    }
  };
  
  const deleteTodo = async (id: string) => {
    try {
      // First delete from Supabase if authenticated and sync is enabled
      if (isAuthenticated && userProfile?.cloud_sync_enabled) {
        // console.log('Deleting todo from cloud:', id);
        const { error } = await supabase
          .from('todos')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        // console.log('Todo deleted from cloud successfully');

        // After successful delete, fetch updated todos
        // console.log('Fetching updated todos...');
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
            createdAt: new Date(todo.created_at).getTime(),
            updatedAt: new Date(todo.updated_at).getTime()
          }));
          setTodos(localTodos);
          // console.log('Local todos updated with cloud data');
          
          // Update last_synced timestamp in profile
          await updateLastSynced();
        }
      } else {
        // If not authenticated or sync disabled, just update local storage
        const updatedTodos = todos.filter(todo => todo.id !== id);
        setTodos(updatedTodos);
        // console.log('Todo deleted from local storage only');
      }
    } catch (error) {
      // console.error('Error deleting todo:', error);
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
      // console.error('Error updating last_synced timestamp:', error);
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

  /* 
  
    height if expanded should be screen height - 100px
    if not expanded should be secreen height / 2 - 100px

    we need to create a function that returns the height based on the screen size
  */

  const { width,height } = useWindowSize();

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
      ref={todoListRef}
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
        mass: 1
      }}
      className={cn(
        "glass dark:glass-dark transition-all rounded-xl text-white overflow-hidden flex flex-col relative",
        isExpanded ? "mx-auto z-50" : "w-full"
      )}
      style={{
        width: getWidthByScreenSize(),
        boxShadow: isExpanded ? '0 0 0 100vw rgba(0, 0, 0, 0)' : '',
        transition: 'box-shadow 50ms ease-in-out',
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
          <CheckSquare className="h-5 w-5" />
          <span>{t("todoList")}</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="text-xs text-white/70">
            {activeTodosCount} {t("itemsLeft")}
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
              placeholder={t("whatNeedsToBeDone")}
              className="flex-grow bg-black/20 px-4 py-2 rounded-l outline-none placeholder:text-white/50"
              maxLength={TODO_CHAR_LIMIT}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-r text-white transition-colors"
            >
              {t("add")}
            </button>
          </div>
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${charCount >= TODO_CHAR_LIMIT ? 'text-red-400' : 'text-white/50'}`}>
              {charCount}/{TODO_CHAR_LIMIT} {t("characters")}
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-white ml-2 p-1 rounded-md hover:bg-white/10 transition-all duration-200"
                        
                    >
                      <X className="h-4 w-4" />
                    </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t("deleteTodo")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
              {t("all")}
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-2 py-1 rounded ${filter === 'active' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              {t("active")}
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2 py-1 rounded ${filter === 'completed' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              {t("completed")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default TodoList;
