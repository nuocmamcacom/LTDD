import { useEffect, useState } from 'react';
import { auth } from '../services/firebaseConfig';

const API_URL = process.env.API_URL || 'http://localhost:5000';

export function useUserRole() {
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userEmail = auth.currentUser?.email;
        if (!userEmail) {
          setUserRole(null);
          setLoading(false);
          return;
        }

        // Check user role from backend
        const response = await fetch(`${API_URL}/api/users/${userEmail}`);
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role || 'user');
        } else {
          setUserRole('user'); // Default to user role
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserRole('user'); // Default to user role on error
      } finally {
        setLoading(false);
      }
    };

    // Check role when auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkUserRole();
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { userRole, loading, isAdmin: userRole === 'admin' };
}