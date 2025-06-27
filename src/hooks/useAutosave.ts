import { useCallback } from 'react';

interface TestProgress {
  test: any;
  answers: any[];
  currentQuestion: any;
}

export const useAutosave = () => {
  const AUTOSAVE_KEY = 'aeon_autosave';

  // Save progress to localStorage
  const saveProgress = useCallback((progress: TestProgress) => {
    try {
      const dataToSave = {
        ...progress,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
      console.log('Progress autosaved:', dataToSave);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, []);

  // Load progress from localStorage
  const loadProgress = useCallback((): TestProgress | null => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Check if data is not too old (e.g., 24 hours)
        const savedTime = new Date(parsed.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          console.log('Loaded saved progress:', parsed);
          return parsed;
        } else {
          // Clear old data
          localStorage.removeItem(AUTOSAVE_KEY);
          console.log('Cleared old autosave data');
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
      // Clear corrupted data
      localStorage.removeItem(AUTOSAVE_KEY);
    }
    return null;
  }, []);

  // Clear saved progress
  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
      console.log('Cleared saved progress');
    } catch (error) {
      console.error('Failed to clear progress:', error);
    }
  }, []);

  // Check if there's saved progress
  const hasSavedProgress = useCallback((): boolean => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (!saved) return false;
      
      const parsed = JSON.parse(saved);
      const savedTime = new Date(parsed.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
      
      return hoursDiff < 24;
    } catch (error) {
      return false;
    }
  }, []);

  return {
    saveProgress,
    loadProgress,
    clearProgress,
    hasSavedProgress
  };
}; 