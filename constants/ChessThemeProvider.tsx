/**
 * Chess Theme Provider
 * Provides Chess.com inspired theme context to the entire app
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { createChessStyles } from './chessStyles';
import { ChessBorderRadius, ChessColors, ChessFonts, ChessSpacing } from './chessTheme';

const CHESS_THEME_STORAGE_KEY = '@chess_app_dark_mode';

export interface ChessTheme {
  colors: typeof ChessColors.light;
  fonts: typeof ChessFonts;
  spacing: typeof ChessSpacing;
  borderRadius: typeof ChessBorderRadius;
  styles: ReturnType<typeof createChessStyles>;
  isDark: boolean;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ChessThemeContext = createContext<ChessTheme | null>(null);

interface ChessThemeProviderProps {
  children: React.ReactNode;
  forceDark?: boolean;
  forceLight?: boolean;
}

export const ChessThemeProvider: React.FC<ChessThemeProviderProps> = ({
  children,
  forceDark,
  forceLight,
}) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(() => {
    if (forceDark) return true;
    if (forceLight) return false;
    return systemColorScheme === 'dark';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userPreference, setUserPreference] = useState<'dark' | 'light' | null>(null);

  // Load saved theme preference on mount
  useEffect(() => {
    loadSavedTheme();
  }, []);

  // Apply user preference or system theme
  useEffect(() => {
    if (!forceDark && !forceLight && !isLoading) {
      const shouldBeDark = userPreference ? userPreference === 'dark' : systemColorScheme === 'dark';
      setIsDark(shouldBeDark);
    }
  }, [systemColorScheme, userPreference, forceDark, forceLight, isLoading]);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(CHESS_THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        setUserPreference(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load saved chess theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    if (!forceDark && !forceLight) {
      const newTheme = isDark ? 'light' : 'dark';
      setUserPreference(newTheme);
      setIsDark(newTheme === 'dark');
      
      try {
        await AsyncStorage.setItem(CHESS_THEME_STORAGE_KEY, newTheme);
      } catch (error) {
        console.error('Failed to save chess theme:', error);
      }
    }
  };

  const colors = isDark ? ChessColors.dark : ChessColors.light;
  const styles = createChessStyles(isDark);

  const theme: ChessTheme = {
    colors,
    fonts: ChessFonts,
    spacing: ChessSpacing,
    borderRadius: ChessBorderRadius,
    styles,
    isDark,
    toggleTheme,
    isLoading,
  };

  return (
    <ChessThemeContext.Provider value={theme}>
      {children}
    </ChessThemeContext.Provider>
  );
};

export const useChessTheme = (): ChessTheme => {
  const context = useContext(ChessThemeContext);
  if (!context) {
    throw new Error('useChessTheme must be used within a ChessThemeProvider');
  }
  return context;
};

// Hook for easy access to colors
export const useChessColors = () => {
  const { colors } = useChessTheme();
  return colors;
};

// Hook for easy access to styles
export const useChessStyles = () => {
  const { styles } = useChessTheme();
  return styles;
};