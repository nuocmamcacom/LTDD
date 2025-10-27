import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../services/firebaseConfig";
import sessionManager from "../services/sessionManager";

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // User is logged in - start session management with conflict detection
        console.log('🔐 User authenticated:', currentUser.email);
        
        try {
          const sessionStarted = await sessionManager.startSession(currentUser.email!);
          if (sessionStarted) {
            setUser(currentUser);
            setIsSessionReady(true);
            console.log('✅ Session started with multi-device protection');
          } else {
            console.warn('⚠️ Session failed to start, but user is still authenticated');
            setUser(currentUser);
            setIsSessionReady(true);
          }
        } catch (error) {
          console.error('❌ Session error:', error);
          setUser(currentUser);
          setIsSessionReady(true);
        }
      } else {
        // User is logged out
        console.log('🔐 User logged out');
        setUser(null);
        setIsSessionReady(false);
        
        // End session in background
        sessionManager.endSession().catch(console.warn);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, isSessionReady };
}
