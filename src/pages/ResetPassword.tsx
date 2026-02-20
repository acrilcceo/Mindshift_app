import React, { useMemo, useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { mapFirebaseAuthError } from '../utils/firebaseErrors';

const ResetPassword: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const idValid = useMemo(() => /^[a-zA-Z0-9]{6,20}$/.test(userId), [userId]);
  const emailValid = useMemo(() => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email), [email]);
  const canSubmit = (idValid || emailValid) && !!auth && !processing;

  const submit = async () => {
    setMessage(null);
    setError(null);
    if (!auth) {
      setError('Configuration error. Please contact admin.');
      return;
    }
    setProcessing(true);
    try {
      const targetEmail = emailValid ? email : `${userId}@mindshift.local`;
      await sendPasswordResetEmail(auth, targetEmail);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (e: any) {
      setError(mapFirebaseAuthError(e));
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
            <h1 className="text-2xl font-serif text-primary font-bold tracking-tight">Reset Password</h1>
          </div>
          <p className="label text-secondary">Enter User ID or Email</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label text-secondary">User ID</label>
            <input
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="6–20 alphanumeric"
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[12px] text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-invalid={!idValid && userId.length > 0}
            />
          </div>
          <div>
            <label className="label text-secondary">Email (optional)</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@domain.com"
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[12px] text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-invalid={!emailValid && email.length > 0}
            />
            <div className="text-[11px] text-secondary mt-1">If provided, email takes precedence over User ID.</div>
          </div>
        </div>

        {message && <div role="status" className="text-[12px] text-green-700 dark:text-green-400">{message}</div>}
        {error && <div role="alert" className="text-[12px] text-red-600 dark:text-red-400">{error}</div>}

        <div className="flex gap-3">
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="w-full h-12 min-w-[44px] min-h-[44px] rounded-2xl bg-slate-900 dark:bg-amber-500 text-white dark:text-black text-[12px] font-bold hover:opacity-90 active:scale-95 transition-theme focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            aria-label="Send password reset email"
          >
            {processing ? 'Sending…' : 'Send Reset Link'}
          </button>
          <Link
            to="/login"
            className="px-4 h-12 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-white/60 dark:bg-white/10 text-secondary hover:bg-white active:scale-95 transition-theme focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            aria-label="Back to Login"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
