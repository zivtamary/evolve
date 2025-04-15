import { useState, useEffect } from 'react';

interface StoredData<T> {
  value: T;
  timestamp: number;
}

interface EvolveData {
  [key: string]: StoredData<unknown> | unknown;
}

const STORAGE_KEY = 'evolve_data';

// Helper function to get the entire evolve_data object from localStorage
const getEvolveData = (): EvolveData => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const data = window.localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.warn(`Error reading ${STORAGE_KEY} from localStorage:`, error);
    return {};
  }
};

// Helper function to save the entire evolve_data object to localStorage
const saveEvolveData = (data: EvolveData): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn(`Error saving ${STORAGE_KEY} to localStorage:`, error);
  }
};

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const evolveData = getEvolveData();
      const item = evolveData[key];
      
      if (item) {
        // Handle both old format (just the value) and new format (with timestamp)
        if (item && typeof item === 'object' && 'value' in item && 'timestamp' in item) {
          return (item as StoredData<T>).value;
        }
        return item as T;
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
        const evolveData = getEvolveData();
        evolveData[key] = {
          value: valueToStore,
          timestamp: Date.now()
        };
        saveEvolveData(evolveData);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const evolveData = JSON.parse(event.newValue) as EvolveData;
          const item = evolveData[key];
          
          if (item) {
            // Handle both formats
            if (item && typeof item === 'object' && 'value' in item && 'timestamp' in item) {
              setStoredValue((item as StoredData<T>).value);
            } else {
              setStoredValue(item as T);
            }
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
