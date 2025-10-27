import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@chess_app_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setCurrentTheme] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on app start
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setCurrentTheme(savedTheme as ThemeMode);
        console.log(`🎨 Theme loaded: ${savedTheme}`);
      }
    } catch (error) {
      console.error('Failed to load saved theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setCurrentTheme(newTheme);
      console.log(`🎨 Theme changed to: ${newTheme}`);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    await setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};