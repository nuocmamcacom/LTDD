import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useChessTheme } from '../../constants/ChessThemeProvider';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { isDark, colors } = useChessTheme();

  return (
    <>
      <StatusBar 
        style={isDark ? 'light' : 'dark'} 
        backgroundColor={colors.background}
      />
      {children}
    </>
  );
};