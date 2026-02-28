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
      const to = (location.state as any)?.from?.pathname || '/home';
      navigate(to, { replace: true });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary transition-colors duration-500">
      <div className="card-base p-8 sm:p-10 rounded-[2rem] w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-primary flex items-center justify-center text-btn-primary font-bold text-xl shadow-lg shadow-accent-glow">
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
              className="w-full bg-secondary border border-card-border rounded-xl px-4 py-3 text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all duration-300"
              aria-invalid={!!error}
            />
          </div>
        </div>

        {info && (
          <div role="status" className="text-sm text-accent-secondary">
            {info}
          </div>
        )}

        {error && (
          <div role="alert" className="text-sm text-error">
            {error}
          </div>
        )}

        <button
          onClick={handleEnter}
          disabled={!canSubmit}
          className="w-full h-12 min-w-[44px] min-h-[44px] rounded-2xl btn-primary-ritual text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Enter app"
        >
          {processing ? 'Entering...' : 'Enter'}
        </button>

        <div className="space-y-3">
          <div className="h-px bg-card-border" />
          <Link
            to="/reset"
            className="w-full h-12 min-w-[44px] min-h-[44px] rounded-2xl bg-secondary border border-card-border text-secondary hover:text-primary hover:border-accent-primary/30 text-sm font-bold hover:shadow-[0_0_15px_var(--accent-glow)] active:scale-95 transition-all duration-300 flex items-center justify-center"
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
