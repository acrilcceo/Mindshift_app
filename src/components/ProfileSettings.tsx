import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PrivateInsights } from './insights/PrivateInsights';

const ProfileSettings: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    navigate('/login', { replace: true, state: { message: 'You have been logged out.' } });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <header className="mb-2 px-1">
        <h1 className="text-2xl font-serif text-white font-bold">Profile</h1>
        <p className="text-white/40 text-sm">Your journey & settings</p>
      </header>

      {/* Private Insights Dashboard */}
      <section>
        <PrivateInsights />
      </section>

      {/* Account Settings */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-widest text-white/40 font-bold">Account</div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-xl">
            {currentUser?.name?.charAt(0).toUpperCase() || 'G'}
          </div>
          <div>
            <div className="text-sm text-white/40">Signed in as</div>
            <div className="text-lg font-bold text-white">
              {currentUser?.name || 'Guest'}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-400 text-sm font-medium transition-colors border border-white/5 hover:border-red-500/20"
          >
            Log out
          </button>
        </div>
      </div>
      
      <div className="text-center text-[10px] text-white/20 pt-8">
        MindShift Manifest v1.2.0
      </div>
    </div>
  );
};

export default ProfileSettings;
