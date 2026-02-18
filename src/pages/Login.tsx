import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
  const { currentUser, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  useEffect(() => {
    if (currentUser && !loading) {
      const to = location.state?.from?.pathname || '/dashboard';
      navigate(to, { replace: true });
    }
  }, [currentUser, loading]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0c]">
      <div className="glass-card p-10 rounded-[2rem] w-full max-w-sm text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-amber-500/20">M</div>
          <h1 className="text-2xl font-serif text-slate-800 dark:text-amber-500 font-bold tracking-tight">MindShift</h1>
        </div>
        <p className="text-[10px] text-muted uppercase tracking-widest">Sign in to continue</p>
        <button
          onClick={login}
          disabled={loading}
          className="w-full px-6 py-3 rounded-2xl bg-slate-900 dark:bg-amber-500 text-white dark:text-black text-[12px] font-bold hover:opacity-90 transition-theme active:scale-95"
          aria-label="Sign in with Google"
        >
          {loading ? 'Loading...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
};

export default Login;
