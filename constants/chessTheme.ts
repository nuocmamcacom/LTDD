/**
 * Chess.com inspired theme and styles
 * Based on Chess.com's design system with dark/light mode support
 */

import { Dimensions, Platform } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Chess.com color palette
export const ChessColors = {
  light: {
    // Primary colors (Chess.com green theme)
    primary: '#7fa650',
    primaryHover: '#739148',
    primaryLight: '#8fb961',
    
    // Background colors
    background: '#ffffff',
    backgroundSecondary: '#f6f6f6',
    backgroundTertiary: '#eeeeee',
    
    // Board colors
    boardLight: '#f0d9b5',
    boardDark: '#b58863',
    
    // Text colors
    text: '#2c2c2c',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textInverse: '#ffffff',
    
    // UI elements
    border: '#e0e0e0',
    borderLight: '#f0f0f0',
    shadow: 'rgba(0, 0, 0, 0.08)',
    
    // Status colors
    success: '#7fa650',
    warning: '#f7b500',
    error: '#dc3545',
    info: '#17a2b8',
    
    // Interactive elements
    buttonPrimary: '#7fa650',
    buttonSecondary: '#6c757d',
    buttonHover: '#739148',
    
    // Card colors
    cardBackground: '#ffffff',
    cardBorder: '#e9ecef',
    cardShadow: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    // Primary colors
    primary: '#7fa650',
    primaryHover: '#8fb961',
    primaryLight: '#96c26a',
    
    // Background colors
    background: '#1a1a1a',
    backgroundSecondary: '#2d2d2d',
    backgroundTertiary: '#404040',
    
    // Board colors
    boardLight: '#e8d5aa',
    boardDark: '#a67c52',
    
    // Text colors
    text: '#ffffff',
    textSecondary: '#cccccc',
    textTertiary: '#999999',
    textInverse: '#2c2c2c',
    
    // UI elements
    border: '#404040',
    borderLight: '#333333',
    shadow: 'rgba(0, 0, 0, 0.3)',
    
    // Status colors
    success: '#7fa650',
    warning: '#f7b500',
    error: '#dc3545',
    info: '#17a2b8',
    
    // Interactive elements
    buttonPrimary: '#7fa650',
    buttonSecondary: '#6c757d',
    buttonHover: '#8fb961',
    
    // Card colors
    cardBackground: '#2d2d2d',
    cardBorder: '#404040',
    cardShadow: 'rgba(0, 0, 0, 0.2)',
  },
};

// Typography system based on Chess.com
export const ChessFonts = Platform.select({
  ios: {
    primary: 'system-ui',
    secondary: 'ui-serif',
    mono: 'ui-monospace',
  },
  android: {
    primary: 'Roboto',
    secondary: 'serif',
    mono: 'monospace',
  },
  web: {
    primary: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif",
    secondary: "Georgia, 'Times New Roman', serif",
    mono: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
  },
  default: {
    primary: 'system',
    secondary: 'serif',
    mono: 'monospace',
  },
});

// Spacing system
export const ChessSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const ChessBorderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Shadows
export const ChessShadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Typography sizes
export const ChessTypography = {
  // Headings
  h1: {
    fontSize: Platform.select({ web: 32, default: 28 }),
    fontWeight: '700' as const,
    lineHeight: Platform.select({ web: 40, default: 36 }),
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: Platform.select({ web: 28, default: 24 }),
    fontWeight: '600' as const,
    lineHeight: Platform.select({ web: 36, default: 32 }),
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: Platform.select({ web: 24, default: 20 }),
    fontWeight: '600' as const,
    lineHeight: Platform.select({ web: 32, default: 28 }),
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: Platform.select({ web: 20, default: 18 }),
    fontWeight: '600' as const,
    lineHeight: Platform.select({ web: 28, default: 26 }),
  },
  
  // Body text
  body: {
    fontSize: Platform.select({ web: 16, default: 14 }),
    fontWeight: '400' as const,
    lineHeight: Platform.select({ web: 24, default: 20 }),
  },
  bodyLarge: {
    fontSize: Platform.select({ web: 18, default: 16 }),
    fontWeight: '400' as const,
    lineHeight: Platform.select({ web: 28, default: 24 }),
  },
  bodySmall: {
    fontSize: Platform.select({ web: 14, default: 12 }),
    fontWeight: '400' as const,
    lineHeight: Platform.select({ web: 20, default: 18 }),
  },
  
  // Labels and captions
  label: {
    fontSize: Platform.select({ web: 14, default: 12 }),
    fontWeight: '500' as const,
    lineHeight: Platform.select({ web: 20, default: 18 }),
  },
  caption: {
    fontSize: Platform.select({ web: 12, default: 10 }),
    fontWeight: '400' as const,
    lineHeight: Platform.select({ web: 16, default: 14 }),
  },
  
  // Button text
  button: {
    fontSize: Platform.select({ web: 16, default: 14 }),
    fontWeight: '600' as const,
    lineHeight: Platform.select({ web: 20, default: 18 }),
  },
};

// Responsive breakpoints
export const ChessBreakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

// Helper function to get responsive values
export const getResponsiveValue = (values: { xs?: any; sm?: any; md?: any; lg?: any; xl?: any }) => {
  if (Platform.OS !== 'web') return values.xs || values.sm || values.md;
  
  if (screenWidth >= ChessBreakpoints.xl) return values.xl || values.lg || values.md || values.sm || values.xs;
  if (screenWidth >= ChessBreakpoints.lg) return values.lg || values.md || values.sm || values.xs;
  if (screenWidth >= ChessBreakpoints.md) return values.md || values.sm || values.xs;
  if (screenWidth >= ChessBreakpoints.sm) return values.sm || values.xs;
  return values.xs;
};

// Animation durations
export const ChessAnimations = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Z-index levels
export const ChessZIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
};