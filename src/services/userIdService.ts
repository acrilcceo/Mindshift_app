import { doc, getDoc, runTransaction, serverTimestamp, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

function sanitize(s: string) {
  const base = (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return base;
}

function baseCombos(firstName?: string, lastName?: string) {
  const f = sanitize(firstName || '');
  const l = sanitize(lastName || '');
  const combos = new Set<string>();
  if (f) combos.add(f);
  if (l) combos.add(l);
  if (f && l) combos.add(f + l);
  if (f && l) combos.add(f[0] + l);
  if (f && l) combos.add(f + l[0]);
  if (!combos.size) combos.add('user');
  return Array.from(combos).map(c => c.slice(0, 16));
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
  const deadline = Date.now() + 2500;
  const bases = baseCombos(firstName, lastName);
  for (const base of bases) {
    const seed = base.length >= 6 ? base : (base + randomDigits(6 - base.length));
    const initial = seed.slice(0, 20);
    try {
      const ok = await checkUserIdAvailability(initial);
      await logAttempt({ firstName, lastName, candidate: initial, available: ok });
      if (ok) return initial;
    } catch (e) {
      await logAttempt({ firstName, lastName, candidate: initial, available: false, error: String((e as any)?.message || e) });
    }
    for (let n = 1; n <= 9999 && Date.now() < deadline; n++) {
      const candidate = (seed + String(n)).slice(0, 20);
      try {
        const ok = await checkUserIdAvailability(candidate);
        await logAttempt({ firstName, lastName, candidate, available: ok });
        if (ok) return candidate;
      } catch (e) {
        await logAttempt({ firstName, lastName, candidate, available: false, error: String((e as any)?.message || e) });
      }
    }
  }
  const fallbackBase = bases[0] || 'user';
  const fallback = (fallbackBase + Date.now().toString().slice(-6)).slice(0, 20);
  return fallback;
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

async function logAttempt(payload: { firstName?: string; lastName?: string; candidate: string; available: boolean; error?: string }) {
  try {
    if (!db) return;
    await addDoc(collection(db, 'usernameAttempts'), {
      firstName: payload.firstName || '',
      lastName: payload.lastName || '',
      candidate: payload.candidate,
      available: payload.available,
      error: payload.error || '',
      createdAt: serverTimestamp()
    });
  } catch {}
}
