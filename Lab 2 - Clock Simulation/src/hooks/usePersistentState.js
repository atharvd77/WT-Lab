import { useState, useEffect, useRef } from 'react';

/**
 * Drop-in replacement for useState that mirrors its value to localStorage.
 * Safe against SSR / storage-disabled environments and malformed stored JSON.
 */
export function usePersistentState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const first = useRef(true);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage unavailable (private mode / quota) — fail silently
    }
  }, [key, value]);

  return [value, setValue];
}
