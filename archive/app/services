import Constants from 'expo-constants';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from './firebaseConfig';

class GoogleAuthService {
  private isWebPlatform: boolean;
  private GoogleSignin: any = null;
  private initialized: boolean = false;

  constructor() {
    this.isWebPlatform = Platform.OS === 'web';
    // Don't initialize in constructor to avoid TurboModule errors
  }

  private async initialize() {
    if (this.initialized) return;
    
    console.log('🚀 [GoogleAuth] Initializing...');
    console.log('🔍 [GoogleAuth] Platform:', Platform.OS);
    
    this.initialized = true;
    await this.configure();
  }

  private async loadGoogleSignin() {
    if (!this.isWebPlatform && !this.GoogleSignin) {
      try {
        console.log('📦 [GoogleAuth] Loading module...');
        const module = await import('@react-native-google-signin/google-signin');
        this.GoogleSignin = module.GoogleSignin;
        console.log('✅ [GoogleAuth] Module loaded');
        return true;
      } catch (error: any) {
        console.error('❌ [GoogleAuth] Load failed:', error.message);
        return false;
      }
    }
    return true;
  }

  private async configure() {
    try {
      const googleClientId = Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID;
      console.log('🔑 [GoogleAuth] Client ID found:', !!googleClientId);
      
      if (!googleClientId) {
        console.error('❌ [GoogleAuth] No Client ID');
        return;
      }

      if (!this.isWebPlatform) {
        const loaded = await this.loadGoogleSignin();
        if (loaded && this.GoogleSignin) {
          try {
            console.log('🔧 [GoogleAuth] Testing TurboModule access...');
            this.GoogleSignin.configure({ webClientId: googleClientId });
            console.log('✅ [GoogleAuth] Mobile configured successfully');
          } catch (configError: any) {
            console.error('❌ [GoogleAuth] TurboModule config failed:', {
              message: configError.message,
              code: configError.code
            });
            
            if (configError.message?.includes('TurboModuleRegistry')) {
              console.warn('🔍 [GoogleAuth] TurboModule not accessible in Expo Go');
              this.GoogleSignin = null; // Disable native module
            }
          }
        } else {
          console.warn('⚠️ [GoogleAuth] Module not loaded');
        }
      } else {
        console.log('✅ [GoogleAuth] Web platform ready');
      }
    } catch (error: any) {
      console.error('❌ [GoogleAuth] Config error:', error.message);
    }
  }

  async signIn() {
    await this.initialize(); // Initialize only when needed
    
    try {
      console.log('🔐 [GoogleAuth] Sign-in start...');
      
      if (this.isWebPlatform) {
        console.log('🌐 [GoogleAuth] Using web method...');
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        const result = await signInWithPopup(auth, provider);
        console.log('✅ [GoogleAuth] Web success:', result.user.email);
        return result.user;
      } else {
        console.log('📱 [GoogleAuth] Attempting mobile method...');
        
        await this.loadGoogleSignin();
        if (!this.GoogleSignin) {
          console.warn('⚠️ [GoogleAuth] Native module not available');
          throw new Error('Native Google SignIn not available in Expo Go');
        }
        
        console.log('🔍 [GoogleAuth] Testing hasPlayServices...');
        await this.GoogleSignin.hasPlayServices();
        
        console.log('🚀 [GoogleAuth] Starting native sign-in...');
        const userInfo = await this.GoogleSignin.signIn();
        
        console.log('🎫 [GoogleAuth] Getting tokens...');
        const { idToken } = await this.GoogleSignin.getTokens();
        
        if (!idToken) {
          throw new Error('No ID token received');
        }
        
        console.log('🔥 [GoogleAuth] Creating Firebase credential...');
        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);
        
        console.log('✅ [GoogleAuth] Mobile success:', result.user.email);
        return result.user;
      }
    } catch (error: any) {
      console.error('❌ [GoogleAuth] Sign-in failed:', {
        message: error.message,
        code: error.code,
        name: error.name
      });
      
      if (error.message?.includes('TurboModuleRegistry')) {
        console.warn('🔍 [GoogleAuth] TurboModule error detected');
        throw new Error('Google Sign-In requires a development build or production app.\n\nFor testing, please use email/password login.');
      } else if (error.message?.includes('RNGoogleSignin')) {
        console.warn('🔍 [GoogleAuth] Native module error detected');  
        throw new Error('Google Sign-In not available on this device. Please use email/password login.');
      } else {
        throw new Error('Google Sign-In failed. Please use email/password login.');
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    await this.initialize(); // Initialize only when needed
    
    try {
      console.log('🔍 [GoogleAuth] Checking availability...');
      
      if (this.isWebPlatform) {
        console.log('✅ [GoogleAuth] Web platform - available');
        return true;
      } else {
        console.log('📱 [GoogleAuth] Mobile platform - checking native module...');
        await this.loadGoogleSignin();
        
        if (!this.GoogleSignin) {
          console.warn('❌ [GoogleAuth] Native module not loaded');
          return false;
        }
        
        // Test if we can access the module methods
        try {
          console.log('🧪 [GoogleAuth] Testing module methods...');
          const configured = await this.GoogleSignin.isSignedIn();
          console.log('✅ [GoogleAuth] Native module accessible, configured:', configured);
          return true;
        } catch (testError: any) {
          console.warn('❌ [GoogleAuth] Module method test failed:', testError.message);
          return false;
        }
      }
    } catch (error: any) {
      console.warn('⚠️ [GoogleAuth] Availability check failed:', {
        message: error.message,
        code: error.code
      });
      return false;
    }
  }

  async signOut() {
    await auth.signOut();
    console.log('✅ [GoogleAuth] Signed out');
  }
}

export const googleAuth = new GoogleAuthService();