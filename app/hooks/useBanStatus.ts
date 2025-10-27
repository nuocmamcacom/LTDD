import { useEffect, useState } from 'react';
import { auth } from '../services/firebaseConfig';

const API_URL = process.env.API_URL || 'http://localhost:5000';

interface BanInfo {
  isBanned: boolean;
  bannedBy?: string;
  bannedAt?: string;
  banReason?: string;
}

export function useBanStatus() {
  const [banInfo, setBanInfo] = useState<BanInfo>({ isBanned: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkBanStatus = async () => {
      try {
        const userEmail = auth.currentUser?.email;
        if (!userEmail) {
          setBanInfo({ isBanned: false });
          setLoading(false);
          return;
        }

        console.log('🔍 Checking ban status for:', userEmail);
        
        // Check user ban status from backend
        const response = await fetch(`${API_URL}/api/users/${userEmail}`);
        if (response.ok) {
          const userData = await response.json();
          
          const banData = {
            isBanned: userData.isBanned || false,
            bannedBy: userData.bannedBy,
            bannedAt: userData.bannedAt,
            banReason: userData.banReason
          };
          
          setBanInfo(banData);
          
          if (banData.isBanned) {
            console.log('🚫 User is banned:', banData);
          } else {
            console.log('✅ User is not banned');
          }
        } else {
          console.log('⚠️ Could not check ban status, assuming not banned');
          setBanInfo({ isBanned: false });
        }
      } catch (error) {
        console.error('❌ Error checking ban status:', error);
        setError('Failed to check ban status');
        setBanInfo({ isBanned: false }); // Default to not banned on error
      } finally {
        setLoading(false);
      }
    };

    // Check ban status when auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('🔍 [useBanStatus] Auth state changed:', user?.email || 'No user');
      if (user) {
        checkBanStatus();
      } else {
        console.log('🔍 [useBanStatus] No user, clearing ban info');
        setBanInfo({ isBanned: false });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const recheckBanStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userEmail = auth.currentUser?.email;
      if (!userEmail) return;

      const response = await fetch(`${API_URL}/api/users/${userEmail}`);
      if (response.ok) {
        const userData = await response.json();
        setBanInfo({
          isBanned: userData.isBanned || false,
          bannedBy: userData.bannedBy,
          bannedAt: userData.bannedAt,
          banReason: userData.banReason
        });
      }
    } catch (error) {
      console.error('Error rechecking ban status:', error);
      setError('Failed to recheck ban status');
    } finally {
      setLoading(false);
    }
  };

  return { 
    banInfo, 
    loading, 
    error, 
    isBanned: banInfo.isBanned,
    recheckBanStatus 
  };
}