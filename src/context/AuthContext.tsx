import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db, googleProvider } from '../firebase/firebaseConfig';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { createJournalEntry } from '../services/journalService';
import { assignGeneratedUserId, generateUniqueUserId, reserveUserId } from '../services/userIdService';
import { googleLogin } from '../services/authService';
import { mapFirebaseAuthError } from '../utils/firebaseErrors';

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithUserId?: (userId: string, password: string) => Promise<void>;
  register?: (firstName: string, lastName: string, password: string) => Promise<string>;
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  loginWithUserId: async () => {},
  register: async () => '' as any
});

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
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
          try {
            await assignGeneratedUserId(user.uid, user.displayName || user.email || '');
          } catch {}
          await createJournalEntry('Welcome to MindShift. Begin your journey with your first affirmation.', 'affirmation');
        } else {
          const data = snap.data() as any;
          await setDoc(ref, {
            name: user.displayName || data?.name || '',
            email: user.email || data?.email || '',
            createdAt: data?.createdAt || serverTimestamp()
          }, { merge: true });
          if (!data?.userId) {
            try {
              await assignGeneratedUserId(user.uid, user.displayName || user.email || '');
            } catch {}
          }
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
    if (!auth || !googleProvider) {
      console.error('[auth] Google login attempted without Firebase configuration');
      throw new Error('Configuration error. Please contact admin.');
    }
    try {
      await googleLogin(auth, googleProvider);
    } catch (e) {
      console.error('[auth] Google login failed', e);
      throw new Error(mapFirebaseAuthError(e));
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (e) {
      console.error('[auth] Logout failed', e);
    }
  };

  const loginWithUserId = async (userId: string, password: string) => {
    if (!auth) {
      console.error('[auth] User ID login attempted without Firebase configuration');
      throw new Error('Configuration error. Please contact admin.');
    }
    const email = `${userId}@mindshift.local`;
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      console.error('[auth] User ID login failed', e);
      throw new Error(mapFirebaseAuthError(e));
    }
  };

  const register = async (firstName: string, lastName: string, password: string) => {
    if (!auth || !db) {
      console.error('[auth] Registration attempted without Firebase configuration');
      throw new Error('Configuration error. Please contact admin.');
    }
    try {
      const generated = await generateUniqueUserId(firstName, lastName);
      const email = `${generated}@mindshift.local`;
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const ref = doc(db, 'users', cred.user.uid);
      await setDoc(ref, {
        name: `${firstName} ${lastName}`.trim(),
        userId: generated,
        email,
        createdAt: serverTimestamp()
      }, { merge: true });
      try {
        await reserveUserId(generated, cred.user.uid);
      } catch {}
      return generated;
    } catch (e) {
      console.error('[auth] Registration failed', e);
      throw new Error(mapFirebaseAuthError(e));
    }
  };

  const value = useMemo(() => ({ currentUser, loading, login, logout, loginWithUserId, register }), [currentUser, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
