import { doc, getDoc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

function sanitize(s: string) {
  const base = (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  return base;
}

function baseFrom(firstName?: string, lastName?: string) {
  const f = sanitize(firstName || '');
  const l = sanitize(lastName || '');
  const base = (f + l) || sanitize('user');
  return base.slice(0, 16);
}

function randomDigits(len = 3) {
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export async function checkUserIdAvailability(userId: string): Promise<boolean> {
  if (!db) throw new Error('Firebase not configured');
  const ref = doc(db, 'userIds', userId);
  const snap = await getDoc(ref);
  return !snap.exists() || snap.data()?.active === false;
}

export async function generateUniqueUserId(firstName?: string, lastName?: string): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  const base = baseFrom(firstName, lastName);
  for (let i = 0; i < 20; i++) {
    const suffixLen = i < 10 ? 3 : 4;
    const candidate = (base + randomDigits(suffixLen)).slice(0, 20);
    const ok = await checkUserIdAvailability(candidate);
    if (ok) return candidate;
  }
  const fallback = (base + Date.now().toString().slice(-5)).slice(0, 20);
  const ok = await checkUserIdAvailability(fallback);
  if (ok) return fallback;
  for (let i = 0; i < 100; i++) {
    const candidate = (base + randomDigits(4)).slice(0, 20);
    const ok2 = await checkUserIdAvailability(candidate);
    if (ok2) return candidate;
  }
  throw new Error('Unable to generate a unique user ID');
}

export async function reserveUserId(userId: string, uid: string) {
  if (!db) throw new Error('Firebase not configured');
  const ref = doc(db, 'userIds', userId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists() && snap.data()?.active !== false) {
      throw new Error('User ID is already taken');
    }
    tx.set(ref, {
      uid,
      active: true,
      createdAt: serverTimestamp()
    });
  });
}

export async function releaseUserId(userId: string, uid: string) {
  if (!db) throw new Error('Firebase not configured');
  const ref = doc(db, 'userIds', userId);
  await setDoc(ref, { active: false, releasedAt: serverTimestamp(), releasedBy: uid }, { merge: true });
}

export async function assignGeneratedUserId(uid: string, fullName?: string): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  const [first, ...rest] = (fullName || '').trim().split(/\s+/);
  const last = rest.join(' ');
  const generated = await generateUniqueUserId(first, last);
  const userRef = doc(db, 'users', uid);
  const idRef = doc(db, 'userIds', generated);
  await runTransaction(db, async (tx) => {
    const idSnap = await tx.get(idRef);
    if (idSnap.exists() && idSnap.data()?.active !== false) {
      throw new Error('Generated ID collided; try again');
    }
    tx.set(idRef, { uid, active: true, createdAt: serverTimestamp() });
    tx.set(userRef, {
      userId: generated,
      userIdGeneratedAt: serverTimestamp(),
      userIdHistory: [{ value: generated, at: serverTimestamp(), source: 'auto' }]
    }, { merge: true });
  });
  return generated;
}

export async function updateUserId(uid: string, nextId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  const userRef = doc(db, 'users', uid);
  const nextRef = doc(db, 'userIds', nextId);
  await runTransaction(db, async (tx) => {
    const nextSnap = await tx.get(nextRef);
    if (nextSnap.exists() && nextSnap.data()?.active !== false) throw new Error('User ID not available');
    const userSnap = await tx.get(userRef);
    const data = userSnap.data() as any;
    const prevId = data?.userId;
    tx.set(nextRef, { uid, active: true, createdAt: serverTimestamp() });
    tx.set(userRef, {
      userId: nextId,
      userIdHistory: [...(data?.userIdHistory || []), { value: nextId, at: serverTimestamp(), source: 'manual' }]
    }, { merge: true });
    if (prevId) {
      const prevRef = doc(db, 'userIds', prevId);
      tx.set(prevRef, { active: false, releasedAt: serverTimestamp(), releasedBy: uid }, { merge: true });
    }
  });
}
