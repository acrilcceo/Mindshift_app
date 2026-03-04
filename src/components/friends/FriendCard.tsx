import React from 'react';
import { Friend } from '../../context/FriendsContext';
import { getAuraStyles } from '../../utils/auraStyles';
import { WeeklyConsistencyRing } from './WeeklyConsistencyRing';

interface FriendCardProps {
  friend: Friend;
  className?: string;
  action?: React.ReactNode;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, className = '', action }) => {
  const auraStyles = getAuraStyles(friend.auraLevel);
  const isOnline = false; // Placeholder for now, or maybe derived from lastRitual recentness?
  
  // Status dot logic
  // "Ritual done today" -> Soft green
  // "Missed today" -> Neutral grey
  // "On fire (7+ days)" -> Subtle amber glow (added to green if done, or just amber?)
  // Requirement says: 
  // "Ritual done today": Soft green
  // "Missed today": Neutral grey
  // "On fire (7+ days)": Subtle amber glow
  
  const isStreakHot = friend.streakCount >= 7;
  const statusColor = friend.isRitualDoneToday 
    ? (isStreakHot ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]')
    : 'bg-textSecondary-light/50 dark:bg-textSecondary-dark/50';

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-card-border bg-surface-elevated dark:bg-darkSurface-elevated p-4 transition-all duration-300 hover:shadow-md dark:hover:bg-darkSurface-elevated ${auraStyles.container} ${className}`}>
      {/* Background Aura Hint */}
      <div className={`absolute inset-0 opacity-20 pointer-events-none ${auraStyles.background}`} />
      
      <div className="relative flex items-center gap-4">
        {/* Avatar Section */}
        <div className="relative">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-surface-muted dark:bg-darkSurface-muted text-lg font-medium text-textPrimary-light dark:text-textPrimary-dark overflow-hidden transition-shadow duration-500 ${auraStyles.avatar}`}>
            {friend.photoURL ? (
              <img src={friend.photoURL} alt={friend.displayName} className="h-full w-full object-cover" />
            ) : (
              <span>{friend.displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          {/* Status Dot */}
          <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface-elevated dark:border-darkSurface-elevated ${statusColor}`} />
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-textPrimary-light dark:text-textPrimary-dark truncate">
            {friend.displayName}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
              {friend.streakCount > 0 ? (
                <span className="flex items-center gap-1">
                  <span className="text-orange-500 dark:text-orange-400">🔥</span> {friend.streakCount} day{friend.streakCount !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-textSecondary-light dark:text-textSecondary-dark">Starting out</span>
              )}
            </span>
          </div>
        </div>

        {/* Consistency Ring or Action */}
        <div className="flex-shrink-0 ml-2">
           {action ? action : <WeeklyConsistencyRing streakCount={friend.streakCount} size={28} />}
        </div>
      </div>
    </div>
  );
};
