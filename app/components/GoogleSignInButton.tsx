import React from 'react';
import { Platform } from 'react-native';

interface GoogleSignInButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  style?: any;
}

export default function GoogleSignInButton({ onSuccess, onError, style }: GoogleSignInButtonProps) {
  // Don't render anything on mobile to avoid TurboModule errors
  if (Platform.OS !== 'web') {
    console.log('🚫 [GoogleButton] Disabled on mobile platform');
    return null;
  }

  // Only load the actual Google Sign-In component on web
  const WebGoogleSignIn = require('./WebGoogleSignIn').default;
  return <WebGoogleSignIn onSuccess={onSuccess} onError={onError} style={style} />;
}