import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  initialTime: number; // seconds
  isActive: boolean;
  playerColor: 'w' | 'b';
  playerName?: string;
  onTimeUp?: () => void;
};

export function ChessTimer({ initialTime, isActive, playerColor, playerName, onTimeUp }: Props) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeUp]);

  // Reset timer when initialTime changes
  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 30; 
  const isVeryLowTime = timeLeft <= 10; 

  return (
    <View style={[
      styles.container,
      playerColor === 'b' && styles.blackPlayer,
      isActive && styles.active,
      isLowTime && styles.lowTime,
      isVeryLowTime && styles.veryLowTime,
    ]}>
      <Text style={styles.playerName}>
        {playerName || (playerColor === 'w' ? 'White' : 'Black')}
      </Text>
      <Text style={[
        styles.time,
        isActive && styles.activeText,
        isLowTime && styles.lowTimeText,
      ]}>
        {formatTime(timeLeft)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  blackPlayer: {
    backgroundColor: '#2c3e50',
  },
  active: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  lowTime: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  veryLowTime: {
    backgroundColor: '#ffcdd2',
    borderColor: '#d32f2f',
  },
  playerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'monospace',
  },
  activeText: {
    color: '#27ae60',
  },
  lowTimeText: {
    color: '#e74c3c',
  },
});