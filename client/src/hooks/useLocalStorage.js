/**
 * useLocalStorage
 * useState-like hook that keeps its value synced with localStorage.
 * Safely handles JSON parse/stringify errors and SSR environments.
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage("theme", "light");
 *   const [recent, setRecent] = useLocalStorage("recently_viewed", []);
 *
 * Pass a function as initialValue for lazy initialisation (same as useState):
 *   const [prefs, setPrefs] = useLocalStorage("prefs", () => ({ lang: "en" }));
 */
import { useState, useCallback } from "react";

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) return JSON.parse(item);
      return typeof initialValue === "function" ? initialValue() : initialValue;
    } catch {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          typeof value === "function" ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (valueToStore === undefined) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`[useLocalStorage] Could not set key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(typeof initialValue === "function" ? initialValue() : initialValue);
    } catch {
      // silently fail
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
