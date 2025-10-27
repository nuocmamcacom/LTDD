import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { Platform } from "react-native";

interface FirebaseConfig {
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
}

const extra = Constants.expoConfig?.extra as FirebaseConfig;

const app = initializeApp({
  apiKey: extra.FIREBASE_API_KEY,
  authDomain: extra.FIREBASE_AUTH_DOMAIN,
  projectId: extra.FIREBASE_PROJECT_ID,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: extra.FIREBASE_APP_ID,
});

let auth: Auth;

try {
  if (Platform.OS === "web") {
    auth = getAuth(app);
  } else {
    // For React Native, use AsyncStorage persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (error) {
  // Fallback if persistence setup fails
  console.warn('Firebase Auth persistence setup failed, using default:', error);
  auth = getAuth(app);
}

export { auth };

