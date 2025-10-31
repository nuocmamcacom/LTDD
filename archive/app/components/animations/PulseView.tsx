import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface PulseViewProps {
  children: React.ReactNode;
  duration?: number;
  minScale?: number;
  maxScale?: number;
  repeat?: boolean;
}

export const PulseView: React.FC<PulseViewProps> = ({
  children,
  duration = 1000,
  minScale = 0.95,
  maxScale = 1.05,
  repeat = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(minScale)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: maxScale,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: minScale,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (repeat) {
          animate();
        }
      });
    };

    animate();
  }, [pulseAnim, duration, minScale, maxScale, repeat]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};