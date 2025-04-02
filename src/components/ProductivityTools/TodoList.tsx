import React, { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Checkbox } from '@/components/ui/checkbox';
import { Check } from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('todos', []);
  const [newTodoText, setNewTodoText] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTodoText.trim()) return;
    
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: Date.now()
    };
    
    setTodos([newTodo, ...todos]);
    setNewTodoText('');
  };
  
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
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
        <h2 className="text-xl font-semibold">Todo List</h2>
        <div className="text-xs text-white/70">
          {activeTodosCount} items left
        </div>
      </div>
      
      <form onSubmit={addTodo} className="p-4 border-b border-white/10">
        <div className="flex">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
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
          
          <button
            onClick={clearCompleted}
            className="text-sm text-white/70 hover:text-white transition-colors"
            disabled={!todos.some(todo => todo.completed)}
          >
            Clear completed
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoList;
