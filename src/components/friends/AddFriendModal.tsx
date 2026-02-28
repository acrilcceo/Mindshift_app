import React, { useState } from 'react';
import { useFriends, Friend } from '../../context/FriendsContext';
import { FriendCard } from './FriendCard';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({ isOpen, onClose }) => {
  const { searchUserByName, addFriend, friends } = useFriends();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchUserByName(searchTerm);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async (friend: Friend) => {
    try {
      await addFriend(friend.id);
      setAddedIds(prev => new Set(prev).add(friend.id));
    } catch (err) {
      console.error(err);
    }
  };

  const isAlreadyFriend = (id: string) => friends.some(f => f.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#151922] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-white">Find a Soul</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
            />
            <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {isSearching ? (
              <div className="text-center py-8 text-gray-500 animate-pulse">Searching the ether...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(friend => {
                const isAdded = addedIds.has(friend.id) || isAlreadyFriend(friend.id);
                return (
                  <FriendCard 
                    key={friend.id} 
                    friend={friend} 
                    action={
                      <button
                        onClick={() => !isAdded && handleAdd(friend)}
                        disabled={isAdded}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          isAdded 
                            ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                            : 'bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30'
                        }`}
                      >
                        {isAdded ? 'Connected' : 'Connect'}
                      </button>
                    }
                  />
                );
              })
            ) : searchTerm && !isSearching ? (
              <div className="text-center py-8 text-gray-500">No souls found.</div>
            ) : (
              <div className="text-center py-8 text-gray-500/50 text-sm">
                Search specifically to find your friends.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
