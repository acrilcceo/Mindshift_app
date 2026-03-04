import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext';
import { useMind } from './MindContext';

export interface Friend {
  id: string;
  displayName: string;
  auraLevel: number;
  streakCount: number;
  lastRitual: string; // ISO string
  photoURL?: string;
  isRitualDoneToday?: boolean; // Derived
}

interface FriendsContextType {
  friends: Friend[];
  loading: boolean;
  addFriend: (friendId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  searchUserByName: (name: string) => Promise<Friend[]>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userUid, currentUser } = useAuth();
  const { state: mindState } = useMind();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Sync current user data to Firestore
  useEffect(() => {
    if (!userUid || !db || !currentUser) return;

    const userRef = doc(db, 'users', userUid);
    const userData = {
      displayName: currentUser.name,
      auraLevel: mindState.auraLevel,
      streakCount: mindState.streakCount,
      lastRitual: mindState.lastRitual,
      // photoURL: ... (future)
      updatedAt: serverTimestamp()
    };

    // Update or create user document
    // We use setDoc with merge to avoid overwriting other fields if they exist
    setDoc(userRef, userData, { merge: true }).catch(console.error);

    // Also update daily activity log
    if (mindState.lastRitual) {
        const date = mindState.lastRitual.split('T')[0];
        const activityRef = doc(db, 'activity', userUid, 'daily', date);
        setDoc(activityRef, {
            ritualCompleted: true,
            auraLevel: mindState.auraLevel,
            timestamp: serverTimestamp()
        }, { merge: true }).catch(console.error);
    }

  }, [userUid, currentUser, mindState.auraLevel, mindState.streakCount, mindState.lastRitual]);

  // 2. Subscribe to Friends List
  useEffect(() => {
    if (!userUid || !db) {
      setFriends([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const friendsRef = collection(db, 'users', userUid, 'friends');
    
    // Store inner subscriptions to clean them up on list updates or unmount
    let friendUnsubscribes: (() => void)[] = [];

    const unsubscribeFriends = onSnapshot(friendsRef, (snapshot) => {
      // 1. Cleanup previous friend listeners
      friendUnsubscribes.forEach(unsub => unsub());
      friendUnsubscribes = [];

      const friendIds = snapshot.docs.map(doc => doc.id);
      
      if (friendIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // 2. Subscribe to each friend's user document
      // Note: This creates N listeners. For < 50 friends this is fine.
      
      // We use a local map to aggregate updates without flickering
      // But since onSnapshot is async, we need to be careful.
      // Actually, we can just update the state directly.
      
      const currentFriendsData: Record<string, Friend> = {};

      friendIds.forEach(friendId => {
        const userDocRef = doc(db, 'users', friendId);
        const unsub = onSnapshot(userDocRef, (userSnap) => {
            if (userSnap.exists()) {
                const data = userSnap.data();
                
                // Calculate if ritual done today
                let isRitualDoneToday = false;
                if (data.lastRitual) {
                    const today = new Date().toISOString().split('T')[0];
                    const ritualDate = typeof data.lastRitual === 'string' ? data.lastRitual.split('T')[0] : '';
                    isRitualDoneToday = today === ritualDate;
                }

                const friendData: Friend = {
                    id: friendId,
                    displayName: data.displayName || 'Unknown Soul',
                    auraLevel: data.auraLevel || 0,
                    streakCount: data.streakCount || 0,
                    lastRitual: data.lastRitual || null,
                    photoURL: data.photoURL,
                    isRitualDoneToday
                };

                // Update the map and state
                // We use functional state update to ensure we don't lose other friends
                setFriends(prev => {
                    // Remove old version of this friend if exists
                    const others = prev.filter(f => f.id !== friendId);
                    // Add new version
                    const updated = [...others, friendData];
                    // Sort by streak count desc
                    return updated.sort((a, b) => b.streakCount - a.streakCount);
                });
            } else {
                // Handle deleted user case if needed
                setFriends(prev => prev.filter(f => f.id !== friendId));
            }
        });
        friendUnsubscribes.push(unsub);
      });
      
      // We might want to set loading false here, but listeners are async.
      // Ideally we wait for initial data, but for now this is okay.
      setLoading(false);

    }, (error) => {
        console.error("Error fetching friends:", error);
        setLoading(false);
    });

    return () => {
      unsubscribeFriends();
      friendUnsubscribes.forEach(unsub => unsub());
    };
  }, [userUid]);

  const addFriend = async (friendId: string) => {
    if (!userUid || !db) return;
    if (friendId === userUid) return; // Cannot add self

    const friendRef = doc(db, 'users', userUid, 'friends', friendId);
    await setDoc(friendRef, {
      addedAt: serverTimestamp()
    });
  };

  const removeFriend = async (friendId: string) => {
    if (!userUid || !db) return;
    const friendRef = doc(db, 'users', userUid, 'friends', friendId);
    await deleteDoc(friendRef);
  };

  const searchUserByName = async (name: string): Promise<Friend[]> => {
      if (!db || !name.trim()) return [];
      
      const searchTerm = name.trim();
      // Prefix search using >= and <= with a high unicode character
      const q = query(
        collection(db, 'users'), 
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        // limit(5) // Optional: limit results
      );
      
      try {
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) return [];

        return snapshot.docs.map(doc => {
            const data = doc.data();
            
            // Calculate if ritual done today (reuse logic if possible, or duplicate for now)
            let isRitualDoneToday = false;
            if (data.lastRitual) {
                const today = new Date().toISOString().split('T')[0];
                const ritualDate = typeof data.lastRitual === 'string' ? data.lastRitual.split('T')[0] : '';
                isRitualDoneToday = today === ritualDate;
            }

            return {
                id: doc.id,
                displayName: data.displayName,
                auraLevel: data.auraLevel || 0,
                streakCount: data.streakCount || 0,
                lastRitual: data.lastRitual || null,
                photoURL: data.photoURL,
                isRitualDoneToday
            };
        });
      } catch (error) {
        console.error("Error searching users:", error);
        return [];
      }
  };

  const value = useMemo(() => ({
    friends,
    loading,
    addFriend,
    removeFriend,
    searchUserByName
  }), [friends, loading]);

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};
