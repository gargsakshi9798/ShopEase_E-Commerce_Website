/**
 * useDebounce
 * Returns a debounced version of the value that only updates after
 * `delay` ms of no changes. Use for search inputs to avoid firing
 * an API call on every keystroke.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchQuery, 350);
 *   useEffect(() => { if (debouncedSearch) fetchResults(debouncedSearch); }, [debouncedSearch]);
 */
import { useState, useEffect } from "react";

const useDebounce = (value, delay = 350) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
