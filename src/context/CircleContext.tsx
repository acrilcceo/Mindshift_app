import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp,
  orderBy,
  limit,
  addDoc,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext';
import { useMind } from './MindContext';
import { calculateGroupAura } from '../utils/groupAura';

// Interfaces
export interface CircleMember {
  userId: string;
  displayName: string;
  auraLevel: number;
  joinedAt: any;
  lastActive?: any;
}

export interface CircleSession {
  id: string;
  circleId: string;
  startTime: any; // Timestamp
  duration: number; // in seconds, e.g., 180 (3 mins)
  activeParticipants: number;
  status: 'active' | 'completed';
}

export interface Circle {
  id: string;
  name: string;
  createdBy: string;
  createdAt: any;
  memberCount: number;
  groupAura: number;
  members?: CircleMember[]; // Optional, fetched on demand
  activeSessionId?: string;
  activeSession?: CircleSession | null;
}

interface CircleContextType {
  myCircles: Circle[];
  loading: boolean;
  createCircle: (name: string) => Promise<string>;
  joinCircle: (circleId: string) => Promise<void>; // Request to join
  startSession: (circleId: string) => Promise<string>;
  joinSession: (circleId: string, sessionId: string) => Promise<void>;
  endSession: (circleId: string, sessionId: string) => Promise<void>;
  currentSession: CircleSession | null;
  leaveSession: () => void;
}

const CircleContext = createContext<CircleContextType | undefined>(undefined);

export const CircleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userUid, currentUser } = useAuth();
  const { state: mindState } = useMind();
  const [myCircles, setMyCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<CircleSession | null>(null);

  // 1. Fetch User's Circles
  useEffect(() => {
    if (!userUid || !db) {
      setMyCircles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // We need to find circles where the user is a member.
    // Firestore doesn't support "array-contains" on subcollections easily for this structure 
    // without a "memberIds" array on the circle document.
    // Let's assume we store `memberIds` array on the circle doc for easier querying, 
    // or we query `circles/{id}/members/{uid}` which is hard for "get all my circles".
    // Better approach: Store `memberIds` array on circle doc (limit 8 members makes this easy).
    
    const circlesQuery = query(
      collection(db, 'circles'), 
      where('memberIds', 'array-contains', userUid)
    );

    const unsubscribe = onSnapshot(circlesQuery, (snapshot) => {
      const circlesData: Circle[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          memberCount: data.memberCount,
          groupAura: data.groupAura || 0,
          activeSessionId: data.activeSessionId,
          // We don't fetch full member details here to save reads
        };
      });
      setMyCircles(circlesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching circles:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userUid]);

  // 2. Create Circle
  const createCircle = async (name: string): Promise<string> => {
    if (!userUid || !db || !currentUser) throw new Error("Not authenticated");
    
    // Check if user is already in too many circles? (Optional limit)

    const circleRef = await addDoc(collection(db, 'circles'), {
      name,
      createdBy: userUid,
      createdAt: serverTimestamp(),
      memberCount: 1,
      groupAura: mindState.auraLevel,
      memberIds: [userUid] // For querying "my circles"
    });

    // Add creator to members subcollection
    await setDoc(doc(db, 'circles', circleRef.id, 'members', userUid), {
      userId: userUid,
      displayName: currentUser.name,
      auraLevel: mindState.auraLevel,
      joinedAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });

    return circleRef.id;
  };

  // 3. Join Circle (Simplified: Add directly for now, or Request flow)
  // Implementing "Request" flow requires another collection. 
  // For MVP/Prompt "Members must approve", let's assume this function handles the "Request".
  const joinCircle = async (circleId: string) => {
    if (!userUid || !db) return;
    
    // Check member count limit
    const circleRef = doc(db, 'circles', circleId);
    const circleSnap = await getDoc(circleRef);
    if (!circleSnap.exists()) throw new Error("Circle not found");
    
    if (circleSnap.data().memberCount >= 8) {
      throw new Error("Circle is full (max 8 members)");
    }

    // Add to joinRequests subcollection
    const requestRef = doc(db, 'circles', circleId, 'joinRequests', userUid);
    await setDoc(requestRef, {
      userId: userUid,
      displayName: currentUser?.name || 'Unknown',
      requestedAt: serverTimestamp()
    });
  };

  // 4. Start Session
  const startSession = async (circleId: string): Promise<string> => {
    if (!userUid || !db) throw new Error("Not authenticated");

    const sessionRef = await addDoc(collection(db, 'circles', circleId, 'sessions'), {
      startTime: serverTimestamp(), // Firestore timestamp
      duration: 180, // 3 minutes
      activeParticipants: 1,
      status: 'active',
      createdBy: userUid
    });

    // Add self as participant
    await setDoc(doc(db, 'circles', circleId, 'sessions', sessionRef.id, 'participants', userUid), {
      joinedAt: serverTimestamp(),
      userId: userUid
    });

    // Update circle with active session
    await updateDoc(doc(db, 'circles', circleId), {
      activeSessionId: sessionRef.id
    });

    setCurrentSession({
      id: sessionRef.id,
      circleId,
      startTime: new Date(), // Approximate until sync
      duration: 180,
      activeParticipants: 1,
      status: 'active'
    });

    return sessionRef.id;
  };

  // 5. Join Session
  const joinSession = async (circleId: string, sessionId: string) => {
    if (!userUid || !db) return;

    const sessionRef = doc(db, 'circles', circleId, 'sessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists() || sessionSnap.data().status !== 'active') {
      throw new Error("Session not active");
    }

    // Add to participants
    await setDoc(doc(db, 'circles', circleId, 'sessions', sessionId, 'participants', userUid), {
      joinedAt: serverTimestamp(),
      userId: userUid
    });

    // Increment count
    await updateDoc(sessionRef, {
      activeParticipants: increment(1)
    });

    setCurrentSession({
      id: sessionId,
      circleId,
      startTime: sessionSnap.data().startTime.toDate(),
      duration: sessionSnap.data().duration,
      activeParticipants: sessionSnap.data().activeParticipants + 1,
      status: 'active'
    });
  };

  // 6. End Session
  const endSession = async (circleId: string, sessionId: string) => {
    if (!userUid || !db) return;

    const sessionRef = doc(db, 'circles', circleId, 'sessions', sessionId);
    const circleRef = doc(db, 'circles', circleId);

    const batch = writeBatch(db);
    batch.update(sessionRef, {
      status: 'completed',
      completedAt: serverTimestamp()
    });
    // Remove active session pointer
    batch.update(circleRef, {
      activeSessionId: null as any // Firestore allows deleting fields or setting null
    });

    await batch.commit();
    setCurrentSession(null);
  };

  const leaveSession = () => {
    setCurrentSession(null);
  };

  // 6. Listen for Active Sessions in My Circles
  useEffect(() => {
    if (!userUid || !db || myCircles.length === 0) return;

    // Listen to each circle for activeSessionId changes
    const unsubscribes = myCircles.map(circle => {
      return onSnapshot(doc(db, 'circles', circle.id), async (docSnap) => {
        const data = docSnap.data();
        if (data?.activeSessionId) {
          // Fetch session details
          // Optimization: Only fetch if we are not already in it?
          // Or just expose it to the UI to show "Join Session" button
        }
      });
    });

    return () => unsubscribes.forEach(u => u());
  }, [myCircles, userUid]);

  const value = useMemo(() => ({
    myCircles,
    loading,
    createCircle,
    joinCircle,
    startSession,
    joinSession,
    currentSession,
    leaveSession
  }), [myCircles, loading, currentSession]);

  return <CircleContext.Provider value={value}>{children}</CircleContext.Provider>;
};

export const useCircles = () => {
  const context = useContext(CircleContext);
  if (!context) throw new Error("useCircles must be used within CircleProvider");
  return context;
};
