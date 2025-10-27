import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';
import ThemeToggle from './ThemeToggle';

export default function ThemeTestCard() {
  const themedStyles = useThemedStyles();

  return (
    <View style={[styles.container, themedStyles.card, themedStyles.border]}>
      <Text style={[styles.title, themedStyles.text]}>Theme Test</Text>
      <Text style={[styles.subtitle, themedStyles.textSecondary]}>
        Current theme: {themedStyles.themeMode}
      </Text>
      <View style={styles.toggleContainer}>
        <ThemeToggle size={32} />
      </View>
      <Text style={[styles.description, themedStyles.textMuted]}>
        Toggle above to test theme switching across the entire app!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  toggleContainer: {
    marginVertical: 16,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});