import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL_STORAGE_KEY = '@chess_app_api_url';
const DEFAULT_PORT = '5000';

interface NetworkConfig {
  host: string;
  port: string;
  baseUrl: string;
  isReachable: boolean;
}

class ApiConnectionManager {
  private currentConfig: NetworkConfig | null = null;
  private testingInProgress = false;
  private initialized = false;

  constructor() {
    // Don't initialize in constructor to avoid duplicate calls
  }

  private async initialize() {
    if (this.initialized) {
      return this.currentConfig?.baseUrl || this.getDefaultUrl();
    }
    
    this.initialized = true;
    
    // Try to load saved URL first
    const savedUrl = await this.loadSavedUrl();
    if (savedUrl) {
      const isReachable = await this.testConnection(savedUrl);
      if (isReachable) {
        // Set the config with the working saved URL
        this.currentConfig = {
          host: this.getLocalIpFromUrl(savedUrl),
          port: DEFAULT_PORT,
          baseUrl: savedUrl,
          isReachable: true
        };
        return savedUrl;
      }
    }

    // Auto-detect if no saved URL or saved URL not reachable
    return await this.autoDetectApiUrl();
  }

  private async loadSavedUrl(): Promise<string | null> {
    try {
      const platform = Platform.OS;
      const key = `${API_URL_STORAGE_KEY}_${platform}`;
      const savedUrl = await AsyncStorage.getItem(key);
      
      if (savedUrl) {
        return savedUrl;
      }
      
      return null;
    } catch (error) {
      console.warn('⚠️ [API] Failed to load saved URL:', error);
      return null;
    }
  }

  private async saveUrl(url: string): Promise<void> {
    try {
      const platform = Platform.OS;
      const key = `${API_URL_STORAGE_KEY}_${platform}`;
      await AsyncStorage.setItem(key, url);
    } catch (error) {
      console.warn('⚠️ [API] Failed to save URL:', error);
    }
  }

  private async testConnection(baseUrl: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
      } else {
        console.error('❌ [API] Connection test failed:', error.message);
      }
      return false;
    }
  }

  private async autoDetectApiUrl(): Promise<string> {
    if (this.testingInProgress) {
      return this.currentConfig?.baseUrl || this.getDefaultUrl();
    }

    this.testingInProgress = true;

    try {
      const candidates = this.generateUrlCandidates();
      for (const candidate of candidates) {
        const isReachable = await this.testConnection(candidate.baseUrl);
        if (isReachable) {
          candidate.isReachable = true;
          this.currentConfig = candidate;
          await this.saveUrl(candidate.baseUrl);
          return candidate.baseUrl;
        }
      }

      // If no candidate works, use default
      const defaultUrl = this.getDefaultUrl();
      this.currentConfig = {
        host: this.getLocalIpFromUrl(defaultUrl),
        port: DEFAULT_PORT,
        baseUrl: defaultUrl,
        isReachable: false
      };
      
      return defaultUrl;
    } finally {
      this.testingInProgress = false;
    }
  }

  private generateUrlCandidates(): NetworkConfig[] {
    const candidates: NetworkConfig[] = [];
    const port = DEFAULT_PORT;

    if (Platform.OS === 'web') {
      // For web, try localhost first
      candidates.push({
        host: 'localhost',
        port,
        baseUrl: `http://localhost:${port}`,
        isReachable: false
      });
      
      candidates.push({
        host: '127.0.0.1',
        port,
        baseUrl: `http://127.0.0.1:${port}`,
        isReachable: false
      });
    } else {
      // For mobile, try common local network ranges
      const commonHosts = [
        '192.168.1.224', // Current laptop IP from terminal output
        '192.168.0.224', // Alternative subnet
        '192.168.1.1',   // Common router IP
        '192.168.0.1',   // Alternative router IP
        '10.0.2.2',      // Android emulator default
        '172.20.10.10',  // Previous IP from logs
      ];

      // Add more systematic IP scanning for 192.168.1.x range
      for (let i = 200; i <= 254; i++) {
        commonHosts.push(`192.168.1.${i}`);
      }

      // Add 192.168.0.x range
      for (let i = 200; i <= 254; i++) {
        commonHosts.push(`192.168.0.${i}`);
      }

      for (const host of commonHosts) {
        candidates.push({
          host,
          port,
          baseUrl: `http://${host}:${port}`,
          isReachable: false
        });
      }
    }

    return candidates;
  }

  private getDefaultUrl(): string {
    if (Platform.OS === 'web') {
      return `http://localhost:${DEFAULT_PORT}`;
    } else {
      // For mobile, use the laptop IP we know from terminal
      return `http://192.168.1.224:${DEFAULT_PORT}`;
    }
  }

  private getLocalIpFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'localhost';
    }
  }

  async getCurrentApiUrl(): Promise<string> {
    if (this.currentConfig?.baseUrl) {
      return this.currentConfig.baseUrl;
    }
    
    return await this.initialize();
  }

  async refreshConnection(): Promise<string> {
    this.currentConfig = null;
    return await this.autoDetectApiUrl();
  }

  async testCurrentConnection(): Promise<boolean> {
    if (!this.currentConfig) {
      return false;
    }
    
    return await this.testConnection(this.currentConfig.baseUrl);
  }

  getCurrentConfig(): NetworkConfig | null {
    return this.currentConfig;
  }
}

export const apiConnectionManager = new ApiConnectionManager();