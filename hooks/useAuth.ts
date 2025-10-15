import { useState, useEffect } from 'react';
import { User } from '@/types';
import { AuthService } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const user = await AuthService.signIn(email, password);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const hasPermission = (requiredRole: 'admin' | 'staff') => {
    if (!user) return false;
    return AuthService.hasPermission(user, requiredRole);
  };

  const canAccess = (resource: string) => {
    if (!user) return false;
    return AuthService.canAccess(user, resource);
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    hasPermission,
    canAccess,
    isAuthenticated: !!user,
  };
}





