import { useMemo } from 'react';
import { getTheme } from '../constants/theme';
import { useTheme } from '../providers/ThemeProvider';

// Hook to get themed styles easily
export const useThemedStyles = () => {
  const { theme: themeMode } = useTheme();
  
  return useMemo(() => {
    const theme = getTheme(themeMode);
    
    return {
      theme,
      themeMode,
      // Common themed styles that can be reused
      container: {
        backgroundColor: theme.colors.background,
      },
      text: {
        color: theme.colors.text,
      },
      textSecondary: {
        color: theme.colors.textSecondary,
      },
      textMuted: {
        color: theme.colors.textMuted,
      },
      card: {
        backgroundColor: theme.colors.backgroundSecondary,
        borderColor: theme.colors.border,
      },
      input: {
        backgroundColor: theme.colors.backgroundSecondary,
        borderColor: theme.colors.border,
        color: theme.colors.text,
      },
      button: {
        backgroundColor: theme.colors.primary,
      },
      buttonSecondary: {
        backgroundColor: theme.colors.secondary,
      },
      buttonAccent: {
        backgroundColor: theme.colors.accent,
      },
      buttonText: {
        color: theme.colors.background,
      },
      border: {
        borderColor: theme.colors.border,
      },
      shadow: theme.shadows.medium,
    };
  }, [themeMode]);
};