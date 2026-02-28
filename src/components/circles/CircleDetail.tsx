import React, { useEffect, useState } from 'react';
import { Circle, CircleMember, useCircles } from '../../context/CircleContext';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { getAuraStyles } from '../../utils/auraStyles';
import { useAuth } from '../../context/AuthContext';

interface CircleDetailProps {
  circle: Circle;
  onClose: () => void;
}

export const CircleDetail: React.FC<CircleDetailProps> = ({ circle, onClose }) => {
  const { userUid } = useAuth();
  const { startSession, joinSession } = useCircles();
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);

  useEffect(() => {
    if (!circle.id || !db) return;

    const q = query(collection(db, 'circles', circle.id, 'members'), orderBy('joinedAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => doc.data() as CircleMember);
      setMembers(membersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [circle.id]);

  const handleStartSession = async () => {
    if (isStartingSession) return;
    setIsStartingSession(true);
    try {
      await startSession(circle.id);
      // Session started, CircleContext will update activeSession
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleJoinSession = async () => {
    const sessionId = circle.activeSession?.id || circle.activeSessionId;
    if (!sessionId) return;
    try {
      await joinSession(circle.id, sessionId);
      onClose();
    } catch (error) {
      console.error("Failed to join session:", error);
    }
  };

  const auraStyles = getAuraStyles(circle.groupAura);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#0F1115] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
        
        {/* Header with Aura Background */}
        <div className="relative p-6 pb-8 overflow-hidden">
          <div className={`absolute inset-0 opacity-30 ${auraStyles.background}`} />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative z-10 text-center">
            <h2 className="text-2xl font-serif text-white font-medium mb-1">{circle.name}</h2>
            <div className="flex items-center justify-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${auraStyles.text} ${auraStyles.border} bg-black/20`}>
                Group Aura: Level {circle.groupAura}
              </span>
              <span className="text-xs text-white/50">{members.length} members</span>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="p-6 pt-2 bg-[#0F1115]">
          <h3 className="text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">Circle Members</h3>
          
          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                  <div className="h-4 w-24 bg-white/10 rounded" />
                </div>
              ))
            ) : (
              members.map((member) => {
                const memberAura = getAuraStyles(member.auraLevel);
                const isMe = member.userId === userUid;
                
                return (
                  <div key={member.userId} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gray-800 ${memberAura.avatar}`}>
                        {member.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white flex items-center gap-2">
                          {member.displayName}
                          {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">You</span>}
                        </div>
                        <div className="text-xs text-white/40">
                          Aura Level {member.auraLevel}
                        </div>
                      </div>
                    </div>
                    {/* Status Indicator (Online/Active) - placeholder */}
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  </div>
                );
              })
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-white/5">
            {circle.activeSessionId ? (
              <button
                onClick={handleJoinSession}
                className="w-full py-3 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 transition-all flex items-center justify-center gap-2 animate-pulse"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
                Join Silent Session (3m)
              </button>
            ) : (
              <button
                onClick={handleStartSession}
                disabled={isStartingSession}
                className="w-full py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isStartingSession ? 'Igniting...' : 'Start Silent Session'}
              </button>
            )}
            
            <p className="text-center text-xs text-white/30 mt-3">
              Silent sessions sync everyone for 3 minutes of presence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
