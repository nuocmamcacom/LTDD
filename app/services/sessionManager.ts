import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { Alert } from 'react-native';
import { auth } from './firebaseConfig';

interface SessionInfo {
  sessionId: string;
  email: string;
  startTime: number;
  port: string;
}

class SessionManager {
  private sessionInfo: SessionInfo | null = null;
  private validationInterval: any = null;
  private isValidating = false;

  async startSession(email: string): Promise<boolean> {
    try {
      // Get current port from window location
      const currentPort = this.getCurrentPort();
      const sessionId = `${email}_${currentPort}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      
      // Check if user already has an active session on a different port
      await this.checkAndClearOtherSessions(email, currentPort);
      
      // Store session locally
      this.sessionInfo = {
        sessionId,
        email,
        startTime: Date.now(),
        port: currentPort
      };
      
      await AsyncStorage.setItem('currentSession', JSON.stringify(this.sessionInfo));
      await AsyncStorage.setItem(`session_${email}`, JSON.stringify(this.sessionInfo));
      
      // Start periodic validation
      this.startSessionValidation();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to start session:', error);
      return false;
    }
  }

  private getCurrentPort(): string {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.port || '3000';
    }
    // For React Native mobile, we don't have window.location
    // Use a static identifier or device-specific info
    return 'mobile-8081';
  }

  private async checkAndClearOtherSessions(email: string, currentPort: string): Promise<void> {
    try {
      const existingSession = await AsyncStorage.getItem(`session_${email}`);
      if (existingSession) {
        const session = JSON.parse(existingSession);
        if (session.port !== currentPort) {
          // Clear the old session
          await AsyncStorage.removeItem(`session_${email}`);
          await AsyncStorage.removeItem('currentSession');
        }
      }
    } catch (error) {
      console.warn('Error checking other sessions:', error);
    }
  }

  async validateSession(): Promise<boolean> {
    if (!this.sessionInfo || this.isValidating) {
      return false;
    }

    this.isValidating = true;

    try {
      // Check if our session is still the active one for this email
      const activeSession = await AsyncStorage.getItem(`session_${this.sessionInfo.email}`);
      if (activeSession) {
        const active = JSON.parse(activeSession);
        
        if (active.sessionId === this.sessionInfo.sessionId) {
          return true;
        } else {
          Alert.alert(
            'Account Logged In Elsewhere',
            `Your account has been logged in from another device/port:\n\nPort: ${active.port}\nTime: ${new Date(active.startTime).toLocaleString()}\n\nYou have been logged out from this device.`,
            [{ text: 'OK', onPress: () => this.forceLogout() }]
          );
          
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('❌ Session validation error:', error);
      return false;
    } finally {
      this.isValidating = false;
    }
  }

  async endSession(): Promise<void> {
    if (!this.sessionInfo) return;

    try {
      // Clear both session storages
      await AsyncStorage.removeItem('currentSession');
      await AsyncStorage.removeItem(`session_${this.sessionInfo.email}`);
      
      await this.clearSessionData();
    } catch (error) {
      console.error('❌ Failed to end session:', error);
      await this.clearSessionData();
    }
  }

  private async forceLogout(): Promise<void> {
    // Stop validation
    this.stopSessionValidation();
    
    // Clear session data
    await this.clearSessionData();
    
    // Sign out from Firebase
    try {
      await signOut(auth);
    } catch (error) {
      console.error('❌ Firebase logout error:', error);
    }
  }

  private async clearSessionData(): Promise<void> {
    this.sessionInfo = null;
    this.stopSessionValidation();
    await AsyncStorage.removeItem('currentSession');
  }

  private startSessionValidation(): void {
    // Check every 10 seconds for session conflicts
    this.validationInterval = setInterval(async () => {
      const isValid = await this.validateSession();
      if (!isValid) {
        this.stopSessionValidation();
      }
    }, 10000);
  }

  private stopSessionValidation(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
  }

  private async getDeviceInfo(): Promise<string> {
    try {
      const platform = 'React Native';
      const port = this.getCurrentPort();
      const timestamp = new Date().toISOString();
      return `${platform} - Port ${port} - ${timestamp}`;
    } catch (error) {
      return 'Unknown Device';
    }
  }

  async restoreSession(): Promise<boolean> {
    try {
      const storedSession = await AsyncStorage.getItem('currentSession');
      if (storedSession) {
        this.sessionInfo = JSON.parse(storedSession);
        
        // Validate the restored session
        const isValid = await this.validateSession();
        if (isValid) {
          this.startSessionValidation();
          return true;
        } else {
          await this.clearSessionData();
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to restore session:', error);
      await this.clearSessionData();
      return false;
    }
  }

  getCurrentSession(): SessionInfo | null {
    return this.sessionInfo;
  }

  isSessionActive(): boolean {
    return this.sessionInfo !== null;
  }
}

export default new SessionManager();