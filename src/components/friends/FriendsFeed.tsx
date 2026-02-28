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
        <h2 className="text-lg font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
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
            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : friends.length > 0 ? (
        <div className="space-y-3">
          {friends.map(friend => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-[#151922] rounded-2xl border border-slate-300 dark:border-slate-700 border-dashed group hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-gray-500 group-hover:text-slate-600 dark:group-hover:text-gray-400 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-slate-900 dark:text-white font-semibold">Your path is quiet.</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-[200px] mx-auto">
            Invite friends to share the journey of consistency.
          </p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            Find Friends
          </button>
        </div>
      )}

      <AddFriendModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
