
import { useState, useEffect } from 'react';

interface StoredData<T> {
  value: T;
  timestamp: number;
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedItem = JSON.parse(item) as StoredData<T> | T;
        
        // Handle both old format (just the value) and new format (with timestamp)
        if (parsedItem && typeof parsedItem === 'object' && 'value' in parsedItem && 'timestamp' in parsedItem) {
          return parsedItem.value;
        }
        return parsedItem as T;
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save to state
      setStoredValue(valueToStore);
      
      // Save to local storage with timestamp
      if (typeof window !== 'undefined') {
        const dataToStore: StoredData<T> = {
          value: valueToStore,
          timestamp: Date.now()
        };
        window.localStorage.setItem(key, JSON.stringify(dataToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          const parsedData = JSON.parse(event.newValue) as StoredData<T> | T;
          
          // Handle both formats
          if (parsedData && typeof parsedData === 'object' && 'value' in parsedData && 'timestamp' in parsedData) {
            setStoredValue(parsedData.value);
          } else {
            setStoredValue(parsedData as T);
          }
        } catch (e) {
          console.error('Error parsing storage event data', e);
        }
      }
    };
    
    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}
