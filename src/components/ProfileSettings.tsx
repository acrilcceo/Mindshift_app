import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileSettings: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    navigate('/login', { replace: true, state: { message: 'You have been logged out.' } });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-secondary font-bold">Profile</div>
            <div className="text-sm text-primary font-semibold">Current Name</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-[12px] text-secondary">You are using MindShift as</div>
          <div className="text-sm font-bold text-primary">
            {currentUser?.name || 'Guest'}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-11 rounded-2xl bg-slate-900 dark:bg-amber-500 text-white dark:text-black text-[12px] font-bold hover:opacity-90 active:scale-95 transition-theme focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            aria-label="Log out of MindShift"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
