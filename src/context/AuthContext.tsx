import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { signInAnonymously, signOut } from 'firebase/auth';

type SimpleUser = {
  name: string;
};

type AuthContextType = {
  currentUser: SimpleUser | null;
  loading: boolean;
  loginWithName: (name: string) => void;
  logout: () => void;
};

const STORAGE_KEY = 'mindshift_user_name';

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  loginWithName: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (stored && stored.trim()) {
        setCurrentUser({ name: stored });
        // Attempt to sign in anonymously to Firebase for data access
        if (auth) {
          signInAnonymously(auth).catch((err) => {
            console.error('Firebase anonymous auth failed:', err);
          });
        }
      } else {
        setCurrentUser(null);
        // Ensure signed out of Firebase if no local user
        if (auth) {
          signOut(auth).catch(() => {});
        }
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithName = (name: string) => {
    const trimmed = name.trim();
    setCurrentUser(trimmed ? { name: trimmed } : null);
    try {
      if (trimmed && typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, trimmed);
        if (auth) {
          signInAnonymously(auth).catch(console.error);
        }
      } else if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
        if (auth) {
          signOut(auth).catch(console.error);
        }
      }
    } catch {}
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.clear();
        const cookies = document.cookie.split(';');
        for (const raw of cookies) {
          const [name] = raw.split('=');
          if (!name) continue;
          document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
        if (auth) {
          signOut(auth).catch(console.error);
        }
      }
    } catch {}
  };

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      loginWithName,
      logout
    }),
    [currentUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
