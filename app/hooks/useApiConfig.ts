import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

const API_URL_KEY = "@chess/api_url";

// Ensure URL has correct schema and format
function normalizeUrl(url: string) {
  // Add http:// if no protocol specified
  if (!/^https?:\/\//i.test(url)) {
    url = `http://${url}`;
  }
  // Remove trailing slashes and add /api
  return url.replace(/\/+$/, "") + "/api";
}

// Platform-specific storage keys
const STORAGE_KEYS = {
  web: "@chess/api_url_web",
  android: "@chess/api_url_android",
  ios: "@chess/api_url_ios",
  default: "@chess/api_url"
};

// Default API URL resolver based on platform
function getDefaultApiUrl() {
  const extra = (Constants.expoConfig?.extra as any) || {};
  if (extra?.API_URL) {
    return normalizeUrl(extra.API_URL);
  }

  if (Platform.OS === "web") {
    console.log("🌐 Using web config");
    return "http://localhost:5000/api";
  }
  if (Platform.OS === "android") {
    console.log("📱 Using android config");
    return "http://10.0.2.2:5000/api";
  }
  
  // Default to localhost but allow override
  console.log("ℹ️ Using default config");
  return "http://localhost:5000/api";
}

export function useApiConfig() {
  const [apiUrl, setApiUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApiUrl();
  }, []);

  async function loadApiUrl() {
    try {
      // Get platform-specific URL first
      const storageKey = STORAGE_KEYS[Platform.OS as keyof typeof STORAGE_KEYS] || STORAGE_KEYS.default;
      const stored = await AsyncStorage.getItem(storageKey);
      
      if (stored) {
        console.log(`🔄 Loading stored URL for ${Platform.OS}:`, stored);
        setApiUrl(stored);
      } else {
        const defaultUrl = getDefaultApiUrl();
        console.log(`📝 Using default URL for ${Platform.OS}:`, defaultUrl);
        setApiUrl(defaultUrl);
        // Save default URL for future use
        await AsyncStorage.setItem(storageKey, defaultUrl);
      }
    } catch (e) {
      console.warn("⚠️ Failed to load API URL:", e);
      setApiUrl(getDefaultApiUrl());
    } finally {
      setLoading(false);
    }
  }

  async function updateApiUrl(newUrl: string) {
    try {
      if (!newUrl.trim()) {
        console.warn("⚠️ Empty URL provided");
        return false;
      }
      const normalized = normalizeUrl(newUrl);
      const storageKey = STORAGE_KEYS[Platform.OS as keyof typeof STORAGE_KEYS] || STORAGE_KEYS.default;
      console.log(`💾 Saving URL for ${Platform.OS}:`, normalized);
      await AsyncStorage.setItem(storageKey, normalized);
      setApiUrl(normalized);
      return true;
    } catch (e) {
      console.error("❌ Failed to save API URL:", e);
      return false;
    }
  }

  return {
    apiUrl,
    loading,
    updateApiUrl,
  };
}