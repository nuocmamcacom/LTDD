import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

interface ThemeToggleProps {
  size?: number;
}

export default function ThemeToggle({ size = 24 }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  
  const iconName = theme === 'light' ? 'moon' : 'sunny';
  const iconColor = theme === 'light' ? '#1a202c' : '#ffffff';
  
  console.log('ThemeToggle render:', { theme, iconName, iconColor });
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={toggleTheme}
      accessibilityLabel={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});