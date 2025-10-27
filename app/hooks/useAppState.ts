import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { friendsManager } from '../services/friendsManager';

export const useAppState = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('App state changed:', appState.current, '->', nextAppState);
      
      // Notify friends manager about app state change
      friendsManager.handleAppStateChange(nextAppState);
      
      appState.current = nextAppState;
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription?.remove();
  }, []);

  return appState.current;
};