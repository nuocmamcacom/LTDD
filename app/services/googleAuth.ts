import Constants from 'expo-constants';

import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';




import { auth } from './firebaseConfig';
import { Platform } from 'react-native';



class GoogleAuthService {import { auth } from './firebaseConfig';

  private isWebPlatform: boolean;

  private GoogleSignin: any = null;import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';



  constructor() {class GoogleAuthService {

    console.log('🚀 [GoogleAuth] Initializing GoogleAuthService...');

      private isWebPlatform: boolean;import { Platform } from 'react-native';import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';

    this.isWebPlatform = Platform.OS === 'web';

      private GoogleSignin: any = null;

    console.log('🔍 [GoogleAuth] Platform detection:', {

      platformOS: Platform.OS,

      appOwnership: Constants.appOwnership,

      isWebPlatform: this.isWebPlatform  constructor() {

    });

        console.log('🚀 [GoogleAuth] Initializing GoogleAuthService...');import { Platform } from 'react-native';import { Platform } from 'react-native';

    this.configure();

  }    



  private async loadGoogleSignin() {    this.isWebPlatform = Platform.OS === 'web';class GoogleAuthService {

    if (!this.isWebPlatform && !this.GoogleSignin) {

      try {    

        console.log('📦 [GoogleAuth] Loading Google SignIn module...');

        const module = await import('@react-native-google-signin/google-signin');    console.log('🔍 [GoogleAuth] Platform detection:', {  private isWebPlatform: boolean;import { auth } from './firebaseConfig';import { auth } from './firebaseConfig';

        this.GoogleSignin = module.GoogleSignin;

        console.log('✅ [GoogleAuth] Module loaded successfully');      platformOS: Platform.OS,

        return true;

      } catch (error: any) {      appOwnership: Constants.appOwnership,  private GoogleSignin: any = null;

        console.error('❌ [GoogleAuth] Module loading failed:', {

          message: error.message,      isWebPlatform: this.isWebPlatform

          code: error.code,

          type: typeof error    });

        });

            

        if (error.message?.includes('TurboModuleRegistry')) {

          console.warn('🔍 [GoogleAuth] TurboModule error - native not available in Expo Go');    this.configure();  constructor() {

        }

          }

        return false;

      }    console.log('🚀 [GoogleAuth] Initializing GoogleAuthService...');// Enhanced logging utility for debuggingclass GoogleAuthService {

    }

    return true;  private async loadGoogleSignin() {

  }

    if (!this.isWebPlatform && !this.GoogleSignin) {    

  private async configure() {

    try {      try {

      console.log('⚙️ [GoogleAuth] Starting configuration...');

              console.log('📦 [GoogleAuth] Loading Google SignIn module...');    this.isWebPlatform = Platform.OS === 'web';const log = {  private isWebPlatform: boolean;

      const googleClientId = Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID;

      console.log('🔑 [GoogleAuth] Client ID check:', !!googleClientId);        const module = await import('@react-native-google-signin/google-signin');

      

      if (!googleClientId) {        this.GoogleSignin = module.GoogleSignin;    

        console.error('❌ [GoogleAuth] No Google Client ID found');

        return;        console.log('✅ [GoogleAuth] Module loaded successfully');

      }

        return true;    console.log('🔍 [GoogleAuth] Platform analysis:', {  info: (msg: string, data?: any) => console.log(`🔵 [GoogleAuth] ${msg}`, data || ''),  private GoogleSignin: any = null;

      if (!this.isWebPlatform) {

        console.log('📱 [GoogleAuth] Configuring for mobile...');      } catch (error: any) {

        

        const loaded = await this.loadGoogleSignin();        console.error('❌ [GoogleAuth] Module load failed:', {      platformOS: Platform.OS,

        if (loaded && this.GoogleSignin) {

          try {          message: error.message,

            this.GoogleSignin.configure({

              webClientId: googleClientId,          code: error.code,      appOwnership: Constants.appOwnership,  success: (msg: string, data?: any) => console.log(`✅ [GoogleAuth] ${msg}`, data || ''),

              offlineAccess: true,

              forceCodeForRefreshToken: true,          stack: error.stack?.substring(0, 200)

            });

            console.log('✅ [GoogleAuth] Mobile configuration complete');        });      isWebPlatform: this.isWebPlatform,

          } catch (configError: any) {

            console.error('❌ [GoogleAuth] Configuration failed:', configError.message);        return false;

          }

        } else {      }      expoVersion: Constants.expoVersion  warn: (msg: string, data?: any) => console.warn(`⚠️ [GoogleAuth] ${msg}`, data || ''),  constructor() {

          console.warn('⚠️ [GoogleAuth] Module not available - fallback mode');

        }    }

      } else {

        console.log('✅ [GoogleAuth] Web platform - Firebase Auth ready');    return true;    });

      }

    } catch (error: any) {  }

      console.error('❌ [GoogleAuth] Configuration error:', error.message);

    }      error: (msg: string, error?: any) => {    // Only use web method on actual web platform

  }

  private async configure() {

  async signIn() {

    try {    try {    this.configure();

      console.log('🔐 [GoogleAuth] Starting sign-in process...');

            const googleClientId = Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID;

      if (this.isWebPlatform) {

        console.log('🌐 [GoogleAuth] Using web method...');      console.log('🔑 [GoogleAuth] Client ID check:', !!googleClientId);  }    console.error(`❌ [GoogleAuth] ${msg}`);    this.isWebPlatform = Platform.OS === 'web';

        return await this.signInWeb();

      } else {      

        console.log('📱 [GoogleAuth] Using mobile method...');

        return await this.signInMobile();      if (!googleClientId) {

      }

        console.error('❌ [GoogleAuth] No Google Client ID found');

    } catch (error: any) {

      console.error('❌ [GoogleAuth] Sign-in failed:', {        return;  private async loadGoogleSignin() {    if (error) {    

        message: error.message,

        code: error.code,      }

        type: typeof error

      });    if (!this.isWebPlatform && !this.GoogleSignin) {

      

      if (error.code === 'auth/popup-closed-by-user') {      if (!this.isWebPlatform) {

        throw new Error('Sign in was cancelled');

      } else if (error.code === 'auth/popup-blocked') {        const loaded = await this.loadGoogleSignin();      try {      console.error('💥 Error details:', {    console.log('🔍 Platform detection:', {

        throw new Error('Popup was blocked by browser');

      } else if (error.message?.includes('TurboModuleRegistry')) {        if (loaded && this.GoogleSignin) {

        throw new Error('Google Sign-In not available on this device. Please use email/password login instead.');

      } else {          this.GoogleSignin.configure({        console.log('📦 [GoogleAuth] Loading @react-native-google-signin/google-signin...');

        throw new Error(error.message || 'Google Sign-In failed');

      }            webClientId: googleClientId,

    }

  }            offlineAccess: true,                message: error.message || 'No message',      platformOS: Platform.OS,



  private async signInWeb() {            forceCodeForRefreshToken: true,

    try {

      console.log('🌐 [GoogleAuth] Starting web sign-in...');          });        const module = await import('@react-native-google-signin/google-signin');

      

      if (!signInWithPopup) {          console.log('✅ [GoogleAuth] Mobile config complete');

        console.error('❌ [GoogleAuth] signInWithPopup not available');

        throw new Error('Web sign-in not supported');        }        this.GoogleSignin = module.GoogleSignin;        code: error.code || 'No code',      appOwnership: Constants.appOwnership,

      }

            } else {

      const provider = new GoogleAuthProvider();

      provider.addScope('email');        console.log('✅ [GoogleAuth] Web config ready');        

      provider.addScope('profile');

            }

      console.log('🚀 [GoogleAuth] Opening popup...');

      const result = await signInWithPopup(auth, provider);    } catch (error: any) {        console.log('✅ [GoogleAuth] Module loaded successfully');        stack: error.stack || 'No stack',      isWebPlatform: this.isWebPlatform

      

      console.log('✅ [GoogleAuth] Web sign-in successful:', {      console.error('❌ [GoogleAuth] Config error:', error.message);

        email: result.user.email,

        uid: result.user.uid    }        console.log('📋 [GoogleAuth] Available methods:', Object.keys(this.GoogleSignin));

      });

        }

      return result.user;

    } catch (error: any) {                type: typeof error,    });

      console.error('❌ [GoogleAuth] Web sign-in error:', error.message);

      throw error;  async signIn() {

    }

  }    try {        return true;



  private async signInMobile() {      console.log('🔐 [GoogleAuth] Starting sign-in...');

    try {

      console.log('📱 [GoogleAuth] Starting mobile sign-in...');            } catch (error: any) {        name: error.name || 'No name',    



      await this.loadGoogleSignin();      if (this.isWebPlatform) {

      

      if (!this.GoogleSignin) {        return await this.signInWeb();        console.error('❌ [GoogleAuth] Module loading failed:', {

        console.warn('⚠️ [GoogleAuth] Native module unavailable');

        throw new Error('Google Sign-In not available on this device. Please use email/password login instead.');      } else {

      }

        return await this.signInMobile();          message: error.message,        toString: error.toString()    this.configure();

      console.log('🔍 [GoogleAuth] Checking Play Services...');

      await this.GoogleSignin.hasPlayServices({      }

        showPlayServicesUpdateDialog: true,

      });    } catch (error: any) {          code: error.code,



      console.log('🚀 [GoogleAuth] Starting native sign-in...');      console.error('❌ [GoogleAuth] Sign-in error:', error.message);

      const userInfo = await this.GoogleSignin.signIn();

            throw new Error('Google Sign-In not available on this device. Please use email/password login instead.');          stack: error.stack,      });  }

      console.log('✅ [GoogleAuth] Native sign-in successful:', {

        email: userInfo.data?.user?.email    }

      });

  }          type: typeof error

      const { idToken } = await this.GoogleSignin.getTokens();



      if (!idToken) {

        throw new Error('No ID token received');  private async signInWeb() {        });    }

      }

    const provider = new GoogleAuthProvider();

      const googleCredential = GoogleAuthProvider.credential(idToken);

      const result = await signInWithCredential(auth, googleCredential);    provider.addScope('email');        

      

      console.log('✅ [GoogleAuth] Firebase auth successful');    provider.addScope('profile');

      return result.user;

                  if (error.message?.includes('TurboModuleRegistry')) {  }  private async loadGoogleSignin() {

    } catch (error: any) {

      console.error('❌ [GoogleAuth] Mobile sign-in error:', error.message);    const result = await signInWithPopup(auth, provider);

      

      if (error.message?.includes('TurboModuleRegistry') ||     console.log('✅ [GoogleAuth] Web sign-in success');          console.warn('🔍 [GoogleAuth] TurboModule error - native module not available in Expo Go');

          error.message?.includes('RNGoogleSignin')) {

        throw new Error('Google Sign-In not available on this device. Please use email/password login instead.');    return result.user;

      }

        }        } else if (error.message?.includes('RNGoogleSignin')) {};    if (!this.isWebPlatform && !this.GoogleSignin) {

      throw error;

    }

  }

  private async signInMobile() {          console.warn('🔍 [GoogleAuth] RNGoogleSignin native module not found');

  async signOut() {

    try {    await this.loadGoogleSignin();

      console.log('🚪 [GoogleAuth] Starting sign-out...');

                  }      try {

      await auth.signOut();

      console.log('✅ [GoogleAuth] Firebase sign-out complete');    if (!this.GoogleSignin) {

      

      if (!this.isWebPlatform && this.GoogleSignin) {      throw new Error('Native module not available');        

        try {

          await this.GoogleSignin.signOut();    }

          console.log('✅ [GoogleAuth] Native sign-out complete');

        } catch (error: any) {        return false;class GoogleAuthService {        console.log('📦 [GoogleAuth] Loading Google SignIn module for mobile...');

          console.warn('⚠️ [GoogleAuth] Native sign-out failed:', error.message);

        }    await this.GoogleSignin.hasPlayServices();

      }

          const userInfo = await this.GoogleSignin.signIn();      }

    } catch (error: any) {

      console.error('❌ [GoogleAuth] Sign-out error:', error.message);    const { idToken } = await this.GoogleSignin.getTokens();

    }

  }        }  private isWebPlatform: boolean;        console.log('📦 [GoogleAuth] Platform info:', {



  async isSignedIn(): Promise<boolean> {    const credential = GoogleAuthProvider.credential(idToken);

    try {

      const result = auth.currentUser !== null;    const result = await signInWithCredential(auth, credential);    return true;

      console.log('❓ [GoogleAuth] Sign-in status:', result);

      return result;    

    } catch (error: any) {

      console.error('❌ [GoogleAuth] Status check error:', error.message);    console.log('✅ [GoogleAuth] Mobile sign-in success');  }  private GoogleSignin: any = null;          OS: Platform.OS,

      return false;

    }    return result.user;

  }

  }

  async getCurrentUser() {

    try {

      const user = auth.currentUser;

      console.log('👤 [GoogleAuth] Current user:', user?.email || 'none');  async signOut() {  private async configure() {          isWebPlatform: this.isWebPlatform,

      return user;

    } catch (error: any) {    try {

      console.error('❌ [GoogleAuth] Get user error:', error.message);

      return null;      await auth.signOut();    try {

    }

  }      if (!this.isWebPlatform && this.GoogleSignin) {

}

        await this.GoogleSignin.signOut();      console.log('⚙️ [GoogleAuth] Starting configuration...');  constructor() {          appOwnership: Constants.appOwnership

export const googleAuth = new GoogleAuthService();
      }

      console.log('✅ [GoogleAuth] Sign-out success');      

    } catch (error: any) {

      console.error('❌ [GoogleAuth] Sign-out error:', error.message);      const googleClientId = Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID;    log.info('🚀 Initializing GoogleAuthService...');        });

    }

  }      



  async getCurrentUser() {      console.log('🔑 [GoogleAuth] Config check:', {            

    return auth.currentUser;

  }        hasClientId: !!googleClientId,

}

        clientIdLength: googleClientId?.length || 0    // Platform detection with detailed logging        const module = await import('@react-native-google-signin/google-signin');

export const googleAuth = new GoogleAuthService();
      });

          this.isWebPlatform = Platform.OS === 'web';        this.GoogleSignin = module.GoogleSignin;

      if (!googleClientId) {

        console.error('❌ [GoogleAuth] Google Client ID missing');            

        return;

      }    log.info('🔍 Platform analysis:', {        console.log('✅ [GoogleAuth] Google SignIn module loaded successfully');



      if (!this.isWebPlatform) {      platformOS: Platform.OS,        console.log('📦 [GoogleAuth] Module methods:', Object.keys(this.GoogleSignin));

        console.log('📱 [GoogleAuth] Configuring for mobile...');

              appOwnership: Constants.appOwnership,        

        const loaded = await this.loadGoogleSignin();

        if (loaded && this.GoogleSignin) {      isWebPlatform: this.isWebPlatform,      } catch (error) {

          try {

            this.GoogleSignin.configure({      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'N/A',        console.error('❌ [GoogleAuth] Failed to load GoogleSignin module:', {

              webClientId: googleClientId,

              offlineAccess: true,      expoVersion: Constants.expoVersion,          error: error.message,

              forceCodeForRefreshToken: true,

              accountName: '',      deviceType: Constants.deviceType          stack: error.stack,

              iosClientId: undefined,

              googleServicePlistPath: undefined,    });          type: typeof error,

              profileImageSize: 120,

            });              code: error.code

            console.log('✅ [GoogleAuth] Mobile configuration complete');

          } catch (configError: any) {    this.configure();        });

            console.error('❌ [GoogleAuth] Configuration failed:', configError);

          }  }        console.warn('🔄 [GoogleAuth] Will fallback to web method');

        } else {

          console.warn('⚠️ [GoogleAuth] Module not available - fallback mode');      }

        }

      } else {  private async loadGoogleSignin() {    }

        console.log('✅ [GoogleAuth] Web platform - Firebase Auth ready');

      }    if (!this.isWebPlatform && !this.GoogleSignin) {  }

    } catch (error: any) {

      console.error('❌ [GoogleAuth] Configuration error:', error);      try {        // Don't throw error here, let it fallback to web method

    }

  }        log.info('📦 Attempting to load @react-native-google-signin/google-signin...');      }



  async signIn() {            }

    try {

      console.log('🔐 [GoogleAuth] Starting sign-in process...');        const startTime = Date.now();  }

      

      if (this.isWebPlatform) {        const module = await import('@react-native-google-signin/google-signin');

        console.log('🌐 [GoogleAuth] Using web method...');

        return await this.signInWeb();        const loadTime = Date.now() - startTime;  private async configure() {

      } else {

        console.log('📱 [GoogleAuth] Using mobile method...');            try {

        return await this.signInMobile();

      }        this.GoogleSignin = module.GoogleSignin;      const googleClientId = Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID;



    } catch (error: any) {              

      console.error('❌ [GoogleAuth] Sign-in failed:', {

        message: error.message,        log.success(`📦 Module loaded successfully in ${loadTime}ms`);      if (!googleClientId) {

        code: error.code,

        type: typeof error        log.info('📋 Available methods:', Object.keys(this.GoogleSignin));        console.error('❌ Google Client ID not found in config');

      });

                      return;

      if (error.code === 'auth/popup-closed-by-user') {

        throw new Error('Sign in was cancelled');        return true;      }

      } else if (error.code === 'auth/popup-blocked') {

        throw new Error('Popup was blocked by browser');      } catch (error) {

      } else if (error.message?.includes('TurboModuleRegistry')) {

        throw new Error('Google Sign-In not available on this device. Please use email/password login instead.');        log.error('📦 Module loading failed', error);      // Only configure GoogleSignin for mobile platforms

      } else {

        throw new Error(error.message || 'Google Sign-In failed');              if (!this.isWebPlatform) {

      }

    }        // Analyze the specific error        await this.loadGoogleSignin();

  }

        if (error.message?.includes('TurboModuleRegistry')) {        

  private async signInWeb() {

    try {          log.warn('🔍 TurboModule error - native module not available in Expo Go');        if (this.GoogleSignin) {

      console.log('🌐 [GoogleAuth] Starting web sign-in...');

              } else if (error.message?.includes('RNGoogleSignin')) {          this.GoogleSignin.configure({

      if (!signInWithPopup) {

        console.error('❌ [GoogleAuth] signInWithPopup not available');          log.warn('🔍 RNGoogleSignin native module not found');            webClientId: googleClientId,

        throw new Error('Web sign-in not supported');

      }        } else {            offlineAccess: true,

      

      const provider = new GoogleAuthProvider();          log.warn('🔍 Unknown module loading error');            forceCodeForRefreshToken: true,

      provider.addScope('email');

      provider.addScope('profile');        }            accountName: '',

      

      console.log('🚀 [GoogleAuth] Opening popup...');                    iosClientId: undefined,

      const result = await signInWithPopup(auth, provider);

              return false;            googleServicePlistPath: undefined,

      console.log('✅ [GoogleAuth] Web sign-in successful:', {

        email: result.user.email,      }            profileImageSize: 120,

        uid: result.user.uid

      });    }          });

      

      return result.user;    return true;          console.log('✅ Google Sign-In configured for mobile');

    } catch (error: any) {

      console.error('❌ [GoogleAuth] Web sign-in error:', error);  }        }

      throw error;

    }      } else {

  }

  private async configure() {        console.log('✅ Web platform detected - using Firebase Auth popup');

  private async signInMobile() {

    try {    try {      }

      console.log('📱 [GoogleAuth] Starting mobile sign-in...');

      log.info('⚙️ Starting Google Auth configuration...');    } catch (error) {

      await this.loadGoogleSignin();

                  console.error('❌ Failed to configure Google Sign-In:', error);

      if (!this.GoogleSignin) {

        console.warn('⚠️ [GoogleAuth] Native module unavailable');      const googleClientId = Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID;    }

        throw new Error('Google Sign-In not available on this device. Please use email/password login instead.');

      }        }



      console.log('🔍 [GoogleAuth] Checking Play Services...');      log.info('🔑 Configuration check:', {

      await this.GoogleSignin.hasPlayServices({

        showPlayServicesUpdateDialog: true,        hasClientId: !!googleClientId,  async signIn() {

      });

        clientIdLength: googleClientId?.length || 0,    try {

      console.log('🚀 [GoogleAuth] Starting native sign-in...');

      const userInfo = await this.GoogleSignin.signIn();        availableKeys: Object.keys(Constants.expoConfig?.extra || {})      console.log('🔐 Starting Google Sign-In...');

      

      console.log('✅ [GoogleAuth] Native sign-in successful:', {      });

        email: userInfo.data?.user?.email

      });            if (this.isWebPlatform) {



      const { idToken } = await this.GoogleSignin.getTokens();      if (!googleClientId) {        return await this.signInWeb();



      if (!idToken) {        log.error('🔑 Google Client ID missing from configuration');      } else {

        throw new Error('No ID token received');

      }        return;        // Try mobile method, fallback to manual email input if fails



      const googleCredential = GoogleAuthProvider.credential(idToken);      }        try {

      const result = await signInWithCredential(auth, googleCredential);

                return await this.signInMobile();

      console.log('✅ [GoogleAuth] Firebase auth successful');

      return result.user;      if (!this.isWebPlatform) {        } catch (mobileError) {

      

    } catch (error: any) {        log.info('📱 Configuring for mobile platform...');          console.warn('❌ Mobile Google Sign-In not available:', mobileError);

      console.error('❌ [GoogleAuth] Mobile sign-in error:', error);

                        throw new Error('Google Sign-In not available on this device. Please use email/password login instead.');

      if (error.message?.includes('TurboModuleRegistry') || 

          error.message?.includes('RNGoogleSignin')) {        const loaded = await this.loadGoogleSignin();        }

        throw new Error('Google Sign-In not available on this device. Please use email/password login instead.');

      }        if (loaded && this.GoogleSignin) {      }

      

      throw error;          try {

    }

  }            const config = {    } catch (error: any) {



  async signOut() {              webClientId: googleClientId,      console.error('❌ Google Sign-In error:', error);

    try {

      console.log('🚪 [GoogleAuth] Starting sign-out...');              offlineAccess: true,      

      

      await auth.signOut();              forceCodeForRefreshToken: true,      if (error.code === 'auth/popup-closed-by-user') {

      console.log('✅ [GoogleAuth] Firebase sign-out complete');

                    accountName: '',        throw new Error('Sign in was cancelled');

      if (!this.isWebPlatform && this.GoogleSignin) {

        try {              iosClientId: undefined,      } else if (error.code === 'auth/popup-blocked') {

          await this.GoogleSignin.signOut();

          console.log('✅ [GoogleAuth] Native sign-out complete');              googleServicePlistPath: undefined,        throw new Error('Popup was blocked by browser');

        } catch (error: any) {

          console.warn('⚠️ [GoogleAuth] Native sign-out failed:', error);              profileImageSize: 120,      } else {

        }

      }            };        throw new Error(error.message || 'Google Sign-In failed');

      

    } catch (error: any) {                  }

      console.error('❌ [GoogleAuth] Sign-out error:', error);

    }            log.info('🔧 Applying GoogleSignin configuration...');    }

  }

            this.GoogleSignin.configure(config);  }

  async isSignedIn(): Promise<boolean> {

    try {            log.success('📱 GoogleSignin configured for mobile');

      const result = auth.currentUser !== null;

      console.log('❓ [GoogleAuth] Sign-in status:', result);              private async signInWeb() {

      return result;

    } catch (error: any) {          } catch (configError) {    try {

      console.error('❌ [GoogleAuth] Status check error:', error);

      return false;            log.error('🔧 GoogleSignin configuration failed', configError);      console.log('🌐 Using web sign-in method...');

    }

  }          }      



  async getCurrentUser() {        } else {      // Check if signInWithPopup is available

    try {

      const user = auth.currentUser;          log.warn('📱 GoogleSignin module not available - fallback mode');      if (!signInWithPopup) {

      console.log('👤 [GoogleAuth] Current user:', user?.email || 'none');

      return user;        }        throw new Error('signInWithPopup not available on this platform');

    } catch (error: any) {

      console.error('❌ [GoogleAuth] Get user error:', error);      } else {      }

      return null;

    }        log.success('🌐 Web platform detected - Firebase Auth popup ready');      

  }

}      }      // Create Google Auth Provider



export const googleAuth = new GoogleAuthService();    } catch (error) {      const provider = new GoogleAuthProvider();

      log.error('⚙️ Configuration failed', error);      provider.addScope('email');

    }      provider.addScope('profile');

  }

      // Sign in with popup (web only)

  async signIn() {      const result = await signInWithPopup(auth, provider);

    try {      console.log('✅ Web Google Sign-In successful:', result.user.email);

      log.info('🔐 Starting Google Sign-In process...');      

      log.info('🎯 Sign-in flow:', {      return result.user;

        platform: Platform.OS,    } catch (error) {

        isWeb: this.isWebPlatform,      console.error('❌ Web sign-in error:', error);

        hasNativeModule: !!this.GoogleSignin      

      });      // Fallback to mobile method if popup doesn't work

      if (error instanceof Error) {

      if (this.isWebPlatform) {  if (error.message?.includes('signInWithPopup') || error.message?.includes('popup')) {

        log.info('🌐 Routing to web sign-in...');    console.log('🔄 Falling back to mobile method...');

        return await this.signInWeb();    return await this.signInMobile();

      } else {  }

        log.info('📱 Routing to mobile sign-in...');}

        return await this.signInMobile();      

      }      throw error;

    }

    } catch (error: any) {  }

      log.error('🔐 Sign-In process failed', error);

        private async signInMobile() {

      // Enhanced error categorization    try {

      if (error.code === 'auth/popup-closed-by-user') {      console.log('📱 Using mobile sign-in method...');

        throw new Error('Sign in was cancelled by user');

      } else if (error.code === 'auth/popup-blocked') {      await this.loadGoogleSignin();

        throw new Error('Sign-in popup was blocked by browser');      

      } else if (error.message?.includes('TurboModuleRegistry')) {      if (!this.GoogleSignin) {

        log.warn('🔍 TurboModule error detected - native module issue');        console.warn('⚠️ Native GoogleSignin not available, using web browser fallback...');

        throw new Error('Google Sign-In not available on this device. Please use email/password login instead.');        return await this.signInWebBrowser();

      } else if (error.message?.includes('RNGoogleSignin')) {      }

        log.warn('🔍 RNGoogleSignin error detected - native binary issue');

        throw new Error('Google Sign-In not available on this device. Please use email/password login instead.');      // Check if device supports Google Play Services

      } else {      await this.GoogleSignin.hasPlayServices({

        throw new Error(error.message || 'Google Sign-In failed unexpectedly');        showPlayServicesUpdateDialog: true,

      }      });

    }

  }      // Get user info from Google

      const userInfo = await this.GoogleSignin.signIn();

  private async signInWeb() {      console.log('✅ Mobile Google Sign-In successful:', userInfo.data?.user?.email);

    try {

      log.info('🌐 Initializing web sign-in...');      // Get Google ID token

            const { idToken } = await this.GoogleSignin.getTokens();

      // Check Firebase Auth popup availability

      if (!signInWithPopup) {      if (!idToken) {

        log.error('🌐 signInWithPopup function not available');        throw new Error('No ID token received from Google');

        throw new Error('Web sign-in not supported on this platform');      }

      }

            // Create Firebase credential

      // Create and configure Google Auth Provider      const googleCredential = GoogleAuthProvider.credential(idToken);

      const provider = new GoogleAuthProvider();

      provider.addScope('email');      // Sign in to Firebase with Google credential

      provider.addScope('profile');      const result = await signInWithCredential(auth, googleCredential);

            

      log.info('🚀 Opening Google sign-in popup...');      console.log('✅ Firebase authentication successful:', result.user.email);

      const popupStart = Date.now();      return result.user;

    } catch (error: any) {

      // Execute sign-in with popup      console.error('❌ Mobile sign-in error:', error);

      const result = await signInWithPopup(auth, provider);      

      const popupTime = Date.now() - popupStart;      // Fallback to web browser if native fails

            if (error.message?.includes('GoogleSignin') || error.message?.includes('Play Services')) {

      log.success(`🎉 Web sign-in successful in ${popupTime}ms`, {        console.log('🔄 Falling back to web browser method...');

        email: result.user.email,        return await this.signInWebBrowser();

        uid: result.user.uid,      }

        displayName: result.user.displayName,      

        photoURL: result.user.photoURL      throw error;

      });    }

        }

      return result.user;

    } catch (error) {  // Web browser fallback for mobile (using WebBrowser from expo)

      log.error('🌐 Web sign-in failed', error);  private async signInWebBrowser() {

          try {

      // Try mobile fallback if popup issues      console.log('🌐 Using web browser fallback for mobile...');

      if (error.message?.includes('popup') || error.code?.includes('popup')) {      

        log.info('🔄 Popup failed, attempting mobile fallback...');      // For now, just show a more user-friendly message

        return await this.signInMobile();      throw new Error('Google Sign-In not available on this device. Please use email/password login instead.');

      }      

          } catch (error: any) {

      throw error;      console.error('❌ Web browser sign-in error:', error);

    }      throw error;

  }    }

  }

  private async signInMobile() {

    try {  async signOut() {

      log.info('📱 Initializing mobile sign-in...');    try {

      console.log('🔐 Signing out from Google...');

      await this.loadGoogleSignin();      

            // Sign out from Firebase first

      if (!this.GoogleSignin) {      await auth.signOut();

        log.warn('📱 Native GoogleSignin unavailable, trying fallback...');      

        return await this.signInWebBrowser();      // Then sign out from Google (mobile only)

      }      if (!this.isWebPlatform && this.GoogleSignin) {

        await this.GoogleSignin.signOut();

      log.info('🔍 Checking Google Play Services...');      }

            

      // Check Google Play Services availability      console.log('✅ Google Sign-Out successful');

      const playServicesCheck = await this.GoogleSignin.hasPlayServices({      

        showPlayServicesUpdateDialog: true,    } catch (error) {

      });      console.error('❌ Google Sign-Out error:', error);

          }

      log.success('✅ Google Play Services available:', playServicesCheck);  }



      log.info('🚀 Starting native GoogleSignin...');  async isSignedIn(): Promise<boolean> {

      const signInStart = Date.now();    try {

            if (this.isWebPlatform) {

      // Execute native Google Sign-In        // For web, check Firebase auth state

      const userInfo = await this.GoogleSignin.signIn();        return auth.currentUser !== null;

      const signInTime = Date.now() - signInStart;      } else {

              // For mobile, check if user is signed in by trying to get current user

      log.success(`📱 Native sign-in successful in ${signInTime}ms`, {        const currentUser = await this.getCurrentUser();

        email: userInfo.data?.user?.email,        return currentUser !== null;

        id: userInfo.data?.user?.id,      }

        name: userInfo.data?.user?.name    } catch (error) {

      });      console.error('❌ Error checking Google sign-in status:', error);

      return false;

      // Get authentication token    }

      log.info('🎫 Retrieving Google ID token...');  }

      const { idToken } = await this.GoogleSignin.getTokens();

  async getCurrentUser() {

      if (!idToken) {    try {

        log.error('🎫 No ID token received from Google');      if (this.isWebPlatform) {

        throw new Error('Authentication token not received');        return auth.currentUser;

      }      } else {

        await this.loadGoogleSignin();

      log.success('🎫 ID token received successfully');        if (this.GoogleSignin) {

      log.info('🔗 Creating Firebase credential...');          const userInfo = await this.GoogleSignin.signInSilently();

                return userInfo;

      // Create Firebase credential from Google token        }

      const googleCredential = GoogleAuthProvider.credential(idToken);        return null;

      }

      // Authenticate with Firebase    } catch (error) {

      const firebaseStart = Date.now();      console.log('📝 No current Google user found');

      const result = await signInWithCredential(auth, googleCredential);      return null;

      const firebaseTime = Date.now() - firebaseStart;    }

        }

      log.success(`🔥 Firebase authentication successful in ${firebaseTime}ms`, {}

        email: result.user.email,

        uid: result.user.uidexport const googleAuth = new GoogleAuthService();
      });
      
      return result.user;
    } catch (error: any) {
      log.error('📱 Mobile sign-in failed', error);
      
      // Comprehensive error handling
      if (error.message?.includes('GoogleSignin') || 
          error.message?.includes('Play Services') ||
          error.message?.includes('TurboModuleRegistry') ||
          error.message?.includes('RNGoogleSignin')) {
        log.info('🔄 Native method failed, trying web browser fallback...');
        return await this.signInWebBrowser();
      }
      
      throw error;
    }
  }

  private async signInWebBrowser() {
    try {
      log.info('🌐 Attempting web browser fallback...');
      
      // For Expo Go, native modules aren't available
      log.warn('📱 Running in Expo Go - native modules not available');
      throw new Error('Google Sign-In not available on this device. Please use email/password login instead.');
      
    } catch (error: any) {
      log.error('🌐 Web browser fallback failed', error);
      throw error;
    }
  }

  async signOut() {
    try {
      log.info('🚪 Starting Google Sign-Out...');
      
      // Sign out from Firebase
      await auth.signOut();
      log.success('🔥 Firebase sign-out successful');
      
      // Sign out from Google (mobile only)
      if (!this.isWebPlatform && this.GoogleSignin) {
        try {
          await this.GoogleSignin.signOut();
          log.success('📱 GoogleSignin sign-out successful');
        } catch (error) {
          log.warn('📱 GoogleSignin sign-out failed', error);
        }
      }
      
      log.success('🎉 Complete sign-out successful');
      
    } catch (error) {
      log.error('🚪 Sign-out failed', error);
    }
  }

  async isSignedIn(): Promise<boolean> {
    try {
      if (this.isWebPlatform) {
        const result = auth.currentUser !== null;
        log.info('🌐 Web sign-in status check:', result);
        return result;
      } else {
        const currentUser = await this.getCurrentUser();
        const result = currentUser !== null;
        log.info('📱 Mobile sign-in status check:', result);
        return result;
      }
    } catch (error) {
      log.error('❓ Sign-in status check failed', error);
      return false;
    }
  }

  async getCurrentUser() {
    try {
      if (this.isWebPlatform) {
        const user = auth.currentUser;
        log.info('👤 Current web user:', user?.email || 'none');
        return user;
      } else {
        await this.loadGoogleSignin();
        if (this.GoogleSignin) {
          const userInfo = await this.GoogleSignin.signInSilently();
          log.info('👤 Current mobile user:', userInfo?.data?.user?.email || 'none');
          return userInfo;
        }
        return null;
      }
    } catch (error) {
      log.info('👤 No current Google user found');
      return null;
    }
  }
}

export const googleAuth = new GoogleAuthService();