import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { soundManager } from '../services/soundManager';

export const SoundToggle: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    const newState = soundManager.toggleSound();
    setSoundEnabled(newState);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={toggleSound}>
      <Text style={styles.icon}>{soundEnabled ? '🔊' : '🔇'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    marginLeft: 8,
  },
  icon: {
    fontSize: 18,
  },
});