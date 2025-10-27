/**
 * Chess Theme Provider
 * Provides Chess.com inspired theme context to the entire app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { createChessStyles } from './chessStyles';
import { ChessBorderRadius, ChessColors, ChessFonts, ChessSpacing } from './chessTheme';

export interface ChessTheme {
  colors: typeof ChessColors.light;
  fonts: typeof ChessFonts;
  spacing: typeof ChessSpacing;
  borderRadius: typeof ChessBorderRadius;
  styles: ReturnType<typeof createChessStyles>;
  isDark: boolean;
  toggleTheme: () => void;
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

  useEffect(() => {
    if (!forceDark && !forceLight) {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, forceDark, forceLight]);

  const toggleTheme = () => {
    if (!forceDark && !forceLight) {
      setIsDark(!isDark);
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