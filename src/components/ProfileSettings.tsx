import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfileSettings: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
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
      </div>
    </div>
  );
};

export default ProfileSettings;
