import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useChessTheme } from '../../constants/ChessThemeProvider';

interface ThemeToggleProps {
  size?: number;
}

export default function ThemeToggle({ size = 24 }: ThemeToggleProps) {
  const { isDark, toggleTheme, colors } = useChessTheme();
  
  const iconName = isDark ? 'sunny' : 'moon';
  const iconColor = colors.text;
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} 
      onPress={toggleTheme}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      accessibilityRole="button"
    >
      <Ionicons 
        name={iconName} 
        size={size} 
        color={iconColor} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});