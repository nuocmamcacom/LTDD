import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { googleAuth } from '../services/googleAuthClean';

interface WebGoogleSignInProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  style?: any;
}

export default function WebGoogleSignIn({ onSuccess, onError, style }: WebGoogleSignInProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await googleAuth.isAvailable();
      setIsAvailable(available);
      console.log('🔍 [WebGoogleSignIn] Availability check result:', available);
    } catch (error) {
      console.warn('⚠️ [WebGoogleSignIn] Availability check failed:', error);
      setIsAvailable(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const user = await googleAuth.signIn();
      
      if (user) {
        onSuccess?.(user);
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      const errorMessage = error.message || 'Google Sign-In failed';
      
      Alert.alert(
        'Sign In Error',
        errorMessage,
        [{ text: 'OK' }]
      );
      
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking availability
  if (isAvailable === null) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.disabledButton, style]}
        disabled={true}
      >
        <View style={styles.content}>
          <ActivityIndicator size="small" color="#666" style={styles.icon} />
          <Text style={styles.disabledText}>Checking availability...</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Don't render anything if not available
  if (!isAvailable) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleGoogleSignIn}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" style={styles.icon} />
        ) : (
          <View style={styles.googleIcon}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
        )}
        <Text style={styles.text}>
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    elevation: 0,
    shadowOpacity: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 12,
  },
  googleIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: '#4285F4',
    fontWeight: 'bold',
    fontSize: 12,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});