// Unified theme system for Chess Online app
import { ThemeMode } from '../providers/ThemeProvider';

const darkTheme = {
  // Main colors
  colors: {
    // Background colors
    background: '#1a202c',
    backgroundSecondary: '#2d3748',
    backgroundCard: '#4a5568',
    
    // Chess theme colors
    primary: '#f39c12',      // Chess gold/orange
    secondary: '#3498db',    // Chess blue
    accent: '#e74c3c',       // Chess red
    success: '#27ae60',      // Green
    warning: '#f1c40f',      // Yellow
    info: '#9b59b6',         // Purple
    
    // Text colors
    text: '#ffffff',
    textSecondary: '#a0aec0',
    textMuted: '#718096',
    
    // UI colors
    border: '#4a5568',
    overlay: 'rgba(0, 0, 0, 0.7)',
    disabled: '#718096',
    
    // Feature button colors
    rooms: '#3498db',        // Blue
    puzzles: '#f39c12',      // Orange
    profile: '#9b59b6',      // Purple
    ai: '#e74c3c',          // Red
    analysis: '#27ae60',     // Green
    friends: '#1abc9c',      // Teal
    comingSoon: '#95a5a6',   // Gray
  },
  
  // Typography
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as 'bold',
      color: '#ffffff',
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as '600',
      color: '#ffffff',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as '600',
      color: '#ffffff',
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal' as 'normal',
      color: '#ffffff',
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal' as 'normal',
      color: '#a0aec0',
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as '600',
      color: '#ffffff',
    },
  },
};

const lightTheme = {
  // Main colors
  colors: {
    // Background colors
    background: '#ffffff',
    backgroundSecondary: '#f7fafc',
    backgroundCard: '#edf2f7',
    
    // Chess theme colors (same as dark for consistency)
    primary: '#f39c12',      // Chess gold/orange
    secondary: '#3498db',    // Chess blue
    accent: '#e74c3c',       // Chess red
    success: '#27ae60',      // Green
    warning: '#f1c40f',      // Yellow
    info: '#9b59b6',         // Purple
    
    // Text colors
    text: '#1a202c',
    textSecondary: '#4a5568',
    textMuted: '#718096',
    
    // UI colors
    border: '#e2e8f0',
    overlay: 'rgba(255, 255, 255, 0.9)',
    disabled: '#a0aec0',
    
    // Feature button colors (same as dark)
    rooms: '#3498db',        // Blue
    puzzles: '#f39c12',      // Orange
    profile: '#9b59b6',      // Purple
    ai: '#e74c3c',          // Red
    analysis: '#27ae60',     // Green
    friends: '#1abc9c',      // Teal
    comingSoon: '#95a5a6',   // Gray
  },
  
  // Typography
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as 'bold',
      color: '#1a202c',
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as '600',
      color: '#1a202c',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as '600',
      color: '#1a202c',
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal' as 'normal',
      color: '#1a202c',
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal' as 'normal',
      color: '#4a5568',
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as '600',
      color: '#ffffff',
    },
  },
};

export const getTheme = (mode: ThemeMode) => {
  const baseTheme = mode === 'light' ? lightTheme : darkTheme;
  
  return {
    ...baseTheme,
    
    // Spacing (same for both themes)
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    
    // Border radius (same for both themes)
    borderRadius: {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      full: 999,
    },
    
    // Shadows (adapt to theme)
    shadows: {
      small: {
        shadowColor: mode === 'light' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: mode === 'light' ? 0.1 : 0.3,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: mode === 'light' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: mode === 'light' ? 0.15 : 0.4,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: mode === 'light' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: mode === 'light' ? 0.2 : 0.5,
        shadowRadius: 16,
        elevation: 8,
      },
    },
    
    // Common component styles
    components: {
      button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center' as 'center',
        justifyContent: 'center' as 'center',
      },
      input: {
        height: 48,
        borderWidth: 1,
        borderColor: baseTheme.colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: baseTheme.colors.backgroundSecondary,
        color: baseTheme.colors.text,
        fontSize: 16,
      },
      card: {
        backgroundColor: baseTheme.colors.backgroundSecondary,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: baseTheme.colors.border,
      },
    },
  };
};

// Backward compatibility - default to dark theme
export const theme = getTheme('dark');

// Text shadow utility for better readability on backgrounds
export const textShadow = {
  textShadowColor: 'rgba(0,0,0,0.8)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
};

export const textShadowStrong = {
  textShadowColor: 'rgba(0,0,0,0.9)',
  textShadowOffset: { width: 2, height: 2 },
  textShadowRadius: 4,
};