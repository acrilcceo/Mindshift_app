import { auth, db } from '../firebase/firebaseConfig';
import { JournalEntry, JournalType } from '../types';

export async function createJournalEntry(content: string, type: JournalType): Promise<void> {
  if (!auth || !db) {
    throw new Error('Configuration error. Please contact admin.');
  }
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  await addDoc(collection(db, 'journals'), {
    userId: uid,
    content,
    type,
    createdAt: serverTimestamp()
  });
}

export async function getUserJournalEntries(userId: string): Promise<JournalEntry[]> {
  if (!db) {
    throw new Error('Configuration error. Please contact admin.');
  }
  const { collection, getDocs, orderBy, query, where } = await import('firebase/firestore');
  const q = query(collection(db, 'journals'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const list: JournalEntry[] = [];
  snap.forEach(docSnap => {
    const data = docSnap.data() as any;
    list.push({
      id: docSnap.id,
      userId: data.userId,
      content: data.content,
      type: data.type,
      createdAt: data.createdAt?.toMillis?.() || Date.now()
    });
  });
  return list;
}
