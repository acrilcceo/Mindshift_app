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
        <h1 className="text-2xl font-serif text-textPrimary-light dark:text-textPrimary-dark font-bold">Profile</h1>
        <p className="text-textSecondary-light dark:text-textSecondary-dark text-sm">Your journey & settings</p>
      </header>

      {/* Private Insights Dashboard */}
      <section>
        <PrivateInsights />
      </section>

      {/* Account Settings */}
      <div className="p-6 rounded-2xl bg-surface-elevated dark:bg-darkSurface-elevated border border-card-border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-widest text-textSecondary-light dark:text-textSecondary-dark font-bold opacity-70">Account</div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-secondary/20 flex items-center justify-center text-accent-secondary dark:text-accent-primary font-bold text-xl">
            {currentUser?.name?.charAt(0).toUpperCase() || 'G'}
          </div>
          <div>
            <div className="text-sm text-textSecondary-light dark:text-textSecondary-dark opacity-70">Signed in as</div>
            <div className="text-lg font-bold text-textPrimary-light dark:text-textPrimary-dark">
              {currentUser?.name || 'Guest'}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-card-border">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-surface-muted dark:bg-darkSurface-muted hover:bg-error dark:hover:bg-error text-textSecondary-light dark:text-textSecondary-dark hover:text-error dark:hover:text-error text-sm font-medium transition-colors border border-transparent hover:border-error/30"
          >
            Log out
          </button>
        </div>
      </div>
      
      <div className="text-center text-[10px] text-textSecondary-light dark:text-textSecondary-dark opacity-40 pt-8">
        MindShift Manifest v1.2.0
      </div>
    </div>
  );
};

export default ProfileSettings;
