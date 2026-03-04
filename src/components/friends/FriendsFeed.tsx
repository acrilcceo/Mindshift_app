import React, { useState } from 'react';
import { useFriends } from '../../context/FriendsContext';
import { FriendCard } from './FriendCard';
import { AddFriendModal } from './AddFriendModal';

export const FriendsFeed: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { friends, loading } = useFriends();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-medium text-textPrimary-light dark:text-textPrimary-dark flex items-center gap-2">
          <span className="text-accent-primary">✨</span> Path of Positivity
        </h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="text-sm text-accent-primary hover:text-accent-glow transition-colors font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Soul
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-surface-muted dark:bg-darkSurface-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : friends.length > 0 ? (
        <div className="space-y-3">
          {friends.map(friend => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface-elevated dark:bg-darkSurface-elevated rounded-2xl border border-card-border border-dashed group hover:border-accent-primary/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-surface-muted dark:bg-darkSurface-muted flex items-center justify-center mx-auto mb-3 text-textSecondary-light dark:text-textSecondary-dark group-hover:text-textPrimary-light dark:group-hover:text-textPrimary-dark transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-textPrimary-light dark:text-textPrimary-dark font-semibold">Your path is quiet.</p>
          <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark mt-1 max-w-[200px] mx-auto">
            Invite friends to share the journey of consistency.
          </p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 bg-btn-primary text-btn-primary text-sm font-medium rounded-lg shadow-btn hover:shadow-btn-hover transition-all transform hover:-translate-y-0.5"
          >
            Find Friends
          </button>
        </div>
      )}

      <AddFriendModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
