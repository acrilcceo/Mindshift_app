import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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
      } else {
        setCurrentUser(null);
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
      } else if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
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
