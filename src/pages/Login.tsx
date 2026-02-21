import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const { currentUser, loading, loginWithName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const stateMessage = (location.state as any)?.message;
    if (stateMessage) {
      setInfo(stateMessage);
    }
    if (currentUser && !loading) {
      const to = location.state?.from?.pathname || '/dashboard';
      navigate(to, { replace: true });
    }
  }, [currentUser, loading]);

  const canSubmit = name.trim().length > 0 && !processing;

  const handleEnter = () => {
    setError(null);
    if (!canSubmit) {
      setError('Please enter your name to continue.');
      return;
    }
    setProcessing(true);
    try {
      loginWithName(name);
      const to = location.state?.from?.pathname || '/dashboard';
      navigate(to, { replace: true });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0c]">
      <div className="glass-card p-8 sm:p-10 rounded-[2rem] w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-amber-500/20">
              M
            </div>
            <h1 className="text-2xl font-serif text-primary font-bold tracking-tight">MindShift</h1>
          </div>
          <p className="label text-muted">Enter your name to begin</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label text-secondary">Your Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="How should we address you?"
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[12px] text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-invalid={!!error}
            />
          </div>
        </div>

        {info && (
          <div role="status" className="text-[12px] text-emerald-700 dark:text-emerald-400">
            {info}
          </div>
        )}

        {error && (
          <div role="alert" className="text-[12px] text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleEnter}
          disabled={!canSubmit}
          className="w-full h-12 min-w-[44px] min-h-[44px] rounded-2xl bg-accent ensure-contrast text-[12px] font-bold shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95 transition-theme focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
          aria-label="Enter app"
        >
          {processing ? 'Entering...' : 'Enter'}
        </button>

        <div className="space-y-3">
          <div className="h-px bg-white/20 dark:bg-white/10" />
          <Link
            to="/reset"
            className="w-full h-12 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-900 ensure-contrast dark:bg-amber-500 text-[12px] font-bold hover:opacity-90 active:scale-95 transition-theme focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 text-center flex items-center justify-center"
            aria-label="Forgot Password"
          >
            Forgot Password
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
