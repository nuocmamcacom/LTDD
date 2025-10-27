import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface ScaleInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  initialScale?: number;
  style?: ViewStyle;
}

export const ScaleInView: React.FC<ScaleInViewProps> = ({
  children,
  duration = 400,
  delay = 0,
  initialScale = 0.8,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(initialScale)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};