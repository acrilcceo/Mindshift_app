import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { getAuthToken, setAuthToken, removeAuthToken } from '../api/client';
import { getCurrentUser, logout as apiLogout } from '../api/auth';

export type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
};

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
};

const USER_STORAGE_KEY = 'mindshift_user';

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  updateUser: () => {}
});

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAuthToken();
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (token && storedUser) {
          // Try to parse stored user
          const user = JSON.parse(storedUser) as User;
          setCurrentUser(user);

          // Optionally verify token with backend
          const response = await getCurrentUser();
          if (response.success && response.data) {
            const updatedUser = response.data as User;
            setCurrentUser(updatedUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
          } else {
            // Token might be invalid, but keep user logged in with stored data
            // Backend will return 401 on actual requests if token is expired
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (user: User, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user:', error);
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    
    try {
      // Call API logout
      await apiLogout();
      
      // Clear local storage
      removeAuthToken();
      localStorage.removeItem(USER_STORAGE_KEY);
      
      // Clear any other app data
      const keysToKeep = ['theme']; // Keep theme preference
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // Sign out of Firebase if configured
      if (auth) {
        await signOut(auth).catch(() => {});
      }

      // Clear cookies
      const cookies = document.cookie.split(';');
      for (const raw of cookies) {
        const [name] = raw.split('=');
        if (!name) continue;
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      login,
      logout,
      updateUser
    }),
    [currentUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
