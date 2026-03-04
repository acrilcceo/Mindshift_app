import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { signInAnonymously, signOut } from 'firebase/auth';

type SimpleUser = {
  name: string;
};

type AuthContextType = {
  currentUser: SimpleUser | null;
  userUid: string | null;
  loading: boolean;
  loginWithName: (name: string) => void;
  logout: () => void;
};

const STORAGE_KEY = 'mindshift_user_name';

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userUid: null,
  loading: true,
  loginWithName: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SimpleUser | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (auth) {
      unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          setUserUid(user.uid);
        } else {
          setUserUid(null);
        }
      });
    }

    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (stored && stored.trim()) {
        setCurrentUser({ name: stored });
        if (auth && !auth.currentUser) {
           signInAnonymously(auth).catch(console.error);
        }
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }

    return () => unsubscribe();
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
      userUid,
      loading,
      loginWithName,
      logout
    }),
    [currentUser, userUid, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
