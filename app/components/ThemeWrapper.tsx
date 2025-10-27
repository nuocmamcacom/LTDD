import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { getTheme } from '../constants/theme';
import { useTheme } from '../providers/ThemeProvider';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { theme: themeMode } = useTheme();
  const theme = getTheme(themeMode);

  return (
    <>
      <StatusBar 
        style={themeMode === 'light' ? 'dark' : 'light'} 
        backgroundColor={theme.colors.background}
      />
      {children}
    </>
  );
};