import { useState, useCallback } from 'react';

/**
 * Persists state to localStorage. Works like useState but survives page refresh.
 * @param {string} key  - localStorage key
 * @param {*} initialValue - default value when key is absent
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore =
        typeof value === 'function' ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (e) {
      console.error('useLocalStorage write error:', e);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch { /* noop */ }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
