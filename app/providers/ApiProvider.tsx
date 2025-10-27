import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { setApiUrl } from '../services/api';
import { apiConnectionManager } from '../services/apiConnectionManager';
import { setSocketUrl } from '../services/socket';

interface ApiContextType {
  apiUrl: string | null;
  loading: boolean;
  isConnected: boolean;
  refreshConnection: () => Promise<void>;
  testConnection: () => Promise<boolean>;
}

const ApiContext = createContext<ApiContextType | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [apiUrl, setCurrentApiUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    initializeConnection();
  }, []);

  useEffect(() => {
    if (apiUrl) {
      // API service expects full URLs with /api path
      setApiUrl(apiUrl + '/api');
      // Socket service expects base URL without /api
      setSocketUrl(apiUrl);
    }
  }, [apiUrl]);

  const initializeConnection = async () => {
    try {
      setLoading(true);
      
      const detectedUrl = await apiConnectionManager.getCurrentApiUrl();
      setCurrentApiUrl(detectedUrl);
      
      // Check if we have a verified config from the detection process
      const config = apiConnectionManager.getCurrentConfig();
      if (config?.isReachable) {
        setIsConnected(true);
      } else {
        // Only test if we don't have a verified connection
        const testResult = await apiConnectionManager.testCurrentConnection();
        setIsConnected(testResult);
      }
      
    } catch (error) {
      console.error('❌ ApiProvider failed to initialize connection:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshConnection = async () => {
    setLoading(true);
    
    try {
      const newUrl = await apiConnectionManager.refreshConnection();
      setCurrentApiUrl(newUrl);
      
      const connectionWorks = await apiConnectionManager.testCurrentConnection();
      setIsConnected(connectionWorks);
      
    } catch (error) {
      console.error('❌ ApiProvider failed to refresh connection:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      const result = await apiConnectionManager.testCurrentConnection();
      setIsConnected(result);
      return result;
    } catch (error) {
      console.error('❌ [ApiProvider] Connection test failed:', error);
      setIsConnected(false);
      return false;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <ActivityIndicator size="large" color="#f39c12" />
        <Text style={{ marginTop: 16, fontSize: 16, textAlign: 'center' }}>
          🔍 Auto-detecting API connection...
        </Text>
        <Text style={{ marginTop: 8, fontSize: 14, color: '#666', textAlign: 'center' }}>
          Scanning network for available servers
        </Text>
      </View>
    );
  }

  // Show connection status if API is not reachable
  if (!isConnected && !loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
          Unable to connect to server
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' }}>
          Current URL: {apiUrl}
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' }}>
          Make sure your backend server is running on the same network
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#f39c12',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
            marginBottom: 10
          }}
          onPress={refreshConnection}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            🔄 Retry Connection
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: '#666',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
          }}
          onPress={() => setIsConnected(true)} // Allow offline mode
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            📱 Continue Offline
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const contextValue: ApiContextType = {
    apiUrl,
    loading,
    isConnected,
    refreshConnection,
    testConnection,
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return context;
}