import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db, googleProvider, configured } from '../firebase/firebaseConfig';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { createJournalEntry } from '../services/journalService';

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithUserId?: (userId: string, password: string) => Promise<void>;
  register?: (userId: string, username: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  loginWithUserId: async () => {},
  register: async () => {}
});

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!configured || !auth || !db) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user || null);
      setLoading(false);
      if (user) {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            name: user.displayName || '',
            email: user.email || '',
            createdAt: serverTimestamp(),
            welcomeCreated: true
          }, { merge: true });
          await createJournalEntry('Welcome to MindShift. Begin your journey with your first affirmation.', 'affirmation');
        } else {
          const data = snap.data() as any;
          await setDoc(ref, {
            name: user.displayName || data?.name || '',
            email: user.email || data?.email || '',
            createdAt: data?.createdAt || serverTimestamp()
          }, { merge: true });
          if (!data?.welcomeCreated) {
            await createJournalEntry('Welcome to MindShift. Begin your journey with your first affirmation.', 'affirmation');
            await setDoc(ref, { welcomeCreated: true }, { merge: true });
          }
        }
      }
    });
    return () => unsub();
  }, []);

  const login = async () => {
    if (!configured || !auth || !googleProvider) {
      throw new Error('Firebase is not configured. Please set environment variables.');
    }
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    if (!configured || !auth) return;
    await signOut(auth);
  };

  const loginWithUserId = async (userId: string, password: string) => {
    if (!configured || !auth) throw new Error('Firebase not configured');
    const email = `${userId}@mindshift.local`;
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (userId: string, username: string, password: string) => {
    if (!configured || !auth || !db) throw new Error('Firebase not configured');
    const email = `${userId}@mindshift.local`;
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const ref = doc(db, 'users', cred.user.uid);
    await setDoc(ref, {
      name: username,
      email,
      createdAt: serverTimestamp()
    }, { merge: true });
  };

  const value = useMemo(() => ({ currentUser, loading, login, logout, loginWithUserId, register }), [currentUser, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
