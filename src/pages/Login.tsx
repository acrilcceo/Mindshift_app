import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const { currentUser, loading, login, loginWithUserId, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [userId, setUserId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && !loading) {
      const to = location.state?.from?.pathname || '/dashboard';
      navigate(to, { replace: true });
    }
  }, [currentUser, loading]);

  const idValid = useMemo(() => /^[a-zA-Z0-9]{6,20}$/.test(userId), [userId]);
  const firstValid = useMemo(() => /^[A-Za-z][A-Za-z' -]{1,49}$/.test(firstName.trim()), [firstName]);
  const lastValid = useMemo(() => /^[A-Za-z][A-Za-z' -]{1,49}$/.test(lastName.trim()), [lastName]);
  const passwordValid = useMemo(() => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password), [password]);
  const canCreate = firstValid && lastValid && passwordValid;
  const canLogin = idValid && passwordValid;

  const handleCreateAccount = async () => {
    setError(null);
    setSuccess(null);
    if (!canCreate || !register) return;
    setProcessing(true);
    try {
      const generated = await register(firstName.trim(), lastName.trim(), password);
      setSuccess(`Account created. Your username: ${generated}`);
    } catch (e: any) {
      setError(e?.message || 'Registration failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    if (!canLogin || !loginWithUserId) return;
    setProcessing(true);
    try {
      await loginWithUserId(userId, password);
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0c]">
      <div className="glass-card p-8 sm:p-10 rounded-[2rem] w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-amber-500/20">M</div>
            <h1 className="text-2xl font-serif text-primary font-bold tracking-tight">MindShift</h1>
          </div>
          <p className="label text-muted">{mode === 'register' ? 'Create your account' : 'Sign in to continue'}</p>
        </div>

        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Auth mode">
          <button
            onClick={() => setMode('register')}
            className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-theme ${mode==='register' ? 'bg-slate-900 ensure-contrast dark:bg-amber-500' : 'bg-white/60 dark:bg-white/10 text-secondary'}`}
            role="tab"
            aria-selected={mode==='register'}
          >
            Create Account
          </button>
          <button
            onClick={() => setMode('login')}
            className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-theme ${mode==='login' ? 'bg-slate-900 ensure-contrast dark:bg-amber-500' : 'bg-white/60 dark:bg-white/10 text-secondary'}`}
            role="tab"
            aria-selected={mode==='login'}
          >
            Sign In
          </button>
        </div>

        <div className="space-y-4">
          {mode === 'login' && (
            <div>
              <label className="label text-secondary">User ID</label>
              <input
                value={userId}
                onChange={e => setUserId(e.target.value)}
                placeholder="6–20 alphanumeric"
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[12px] text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                aria-invalid={!idValid}
              />
              {!idValid && userId.length > 0 && <div className="text-[11px] text-red-600 dark:text-red-400 mt-1">User ID must be 6–20 alphanumeric characters.</div>}
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-4">
              <div>
                <label className="label text-secondary">First Name</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Your given name"
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[12px] text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-invalid={!firstValid}
                />
                {!firstValid && firstName.length > 0 && <div className="text-[11px] text-red-600 dark:text-red-400 mt-1">Enter a valid first name.</div>}
              </div>
              <div>
                <label className="label text-secondary">Second/Last Name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Your family name"
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[12px] text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-invalid={!lastValid}
                />
                {!lastValid && lastName.length > 0 && <div className="text-[11px] text-red-600 dark:text-red-400 mt-1">Enter a valid last name.</div>}
              </div>
            </div>
          )}

          <div>
            <label className="label text-secondary">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 chars, U+L+Number+Symbol"
              className="w-full bg.white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[12px] text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-invalid={!passwordValid}
            />
            {!passwordValid && password.length > 0 && <div className="text-[11px] text-red-600 dark:text-red-400 mt-1">Must include uppercase, lowercase, number, and symbol.</div>}
          </div>

          
        </div>

        {error && <div role="alert" className="text-[12px] text-red-600 dark:text-red-400">{error}</div>}
        {success && <div role="status" className="text-[12px] text-emerald-700 dark:text-emerald-400">{success}</div>}

        {mode === 'register' ? (
          <button
            onClick={handleCreateAccount}
            disabled={!canCreate || processing}
            className="w-full h-12 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-900 dark:bg-amber-500 text-white dark:text-black text-[12px] font-bold hover:opacity-90 active:scale-95 transition-theme focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            aria-label="Create Account"
          >
            {processing ? 'Creating...' : 'Create Account'}
          </button>
        ) : (
          <button
            onClick={handleLogin}
            disabled={!canLogin || processing}
            className="w-full h-12 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-900 dark:bg-amber-500 text-white dark:text-black text-[12px] font-bold hover:opacity-90 active:scale-95 transition-theme focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            aria-label="Sign In"
          >
            {processing ? 'Signing in...' : 'Sign In'}
          </button>
        )}

        <div className="space-y-3">
          <div className="h-px bg-white/20 dark:bg-white/10"></div>
          <button
            onClick={login}
            disabled={loading || processing}
            className="w-full h-12 min-w-[44px] min-h-[44px] rounded-2xl bg-white/60 dark:bg-white/10 text-secondary hover:bg-white active:scale-95 transition-theme focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            aria-label="Continue with Google"
          >
            {loading ? 'Loading...' : 'Continue with Google'}
          </button>
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
