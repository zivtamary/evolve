import React, { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useSettings } from '../../context/SettingsContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, CheckSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const { syncTodosOnBlur, isAuthenticated, userProfile } = useSettings();
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('todos', []);
  const [newTodo, setNewTodo] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
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

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const todo: TodoItem = {
      id: crypto.randomUUID(),
      text: newTodo.trim(),
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
  
  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  
  return (
    <div className="glass dark:glass-dark rounded-xl text-white overflow-hidden h-[400px] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          <span>Todo List</span>
        </h2>
        <div className="text-xs text-white/70">
          {activeTodosCount} items left
        </div>
      </div>
      
      <form onSubmit={addTodo} className="p-4 border-b border-white/10">
        <div className="flex">
          <input
            ref={inputRef}
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-grow bg-black/20 px-4 py-2 rounded-l outline-none placeholder:text-white/50"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-r text-white transition-colors"
          >
            Add
          </button>
        </div>
      </form>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {filteredTodos.length === 0 ? (
            <div className="p-4 text-center text-white/50">
              {filter === 'all' 
                ? 'No todos yet. Add one above!' 
                : filter === 'active' 
                  ? 'No active todos' 
                  : 'No completed todos'}
            </div>
          ) : (
            <ul>
              {filteredTodos.map(todo => (
                <li 
                  key={todo.id}
                  className="flex items-center px-4 py-3 border-b border-white/10 group hover:bg-white/5 transition-colors"
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
                    className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-white ml-2 p-1 transition-all duration-200"
                    title="Delete todo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-4 border-t border-white/10">
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
        </div>
      </div>
    </div>
  );
};

export default TodoList;
