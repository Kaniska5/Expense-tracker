/**
 * LocalStorage utility functions
 * Handles all browser localStorage operations with error handling
 */

const STORAGE_PREFIX = 'expense_tracker_';

export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      throw new Error('Storage quota exceeded. Please clear some data. 💗');
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  clear: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  getAllKeys: (): string[] => {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .map((key) => key.replace(STORAGE_PREFIX, ''));
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  },
};

// Session storage for current user session
export const sessionStorage = {
  get: <T>(key: string): T | null => {
    try {
      const item = window.sessionStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from sessionStorage key "${key}":`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      window.sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to sessionStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    try {
      window.sessionStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  },
};
