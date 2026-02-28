import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const ProfileSettings: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  const handleLogout = async () => {
    await logout();
    success('You have been logged out.');
    navigate('/', { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl glass-card border border-card-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-widest text-muted font-bold">Profile</div>
            <div className="text-sm text-secondary font-semibold">Account Details</div>
          </div>
        </div>
        
        {/* User Avatar/Initial */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary text-2xl font-bold">
            {currentUser?.name?.charAt(0).toUpperCase() || 'G'}
          </div>
          <div>
            <div className="text-lg font-bold text-primary">
              {currentUser?.name || 'Guest'}
            </div>
            {currentUser?.email && (
              <div className="text-sm text-muted">
                {currentUser.email}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-11 rounded-2xl btn-secondary-ritual text-sm font-bold transition-theme focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary"
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
