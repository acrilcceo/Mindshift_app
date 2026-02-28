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
    <div className="min-h-screen flex items-center justify-center bg-primary transition-colors duration-500">
      <div className="card-base p-8 sm:p-10 rounded-[2rem] w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-primary flex items-center justify-center text-btn-primary font-bold text-xl shadow-lg shadow-accent-glow">M</div>
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
              className="w-full bg-secondary border border-card-border rounded-xl px-4 py-3 text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all duration-300"
              aria-invalid={!idValid && userId.length > 0}
            />
          </div>
          <div>
            <label className="label text-secondary">Email (optional)</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@domain.com"
              className="w-full bg-secondary border border-card-border rounded-xl px-4 py-3 text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all duration-300"
              aria-invalid={!emailValid && email.length > 0}
            />
            <div className="text-sm text-muted mt-1">If provided, email takes precedence over User ID.</div>
          </div>
        </div>

        {message && <div role="status" className="text-sm text-accent-secondary">{message}</div>}
        {error && <div role="alert" className="text-sm text-error">{error}</div>}

        <div className="flex gap-3">
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="w-full h-12 min-w-[44px] min-h-[44px] rounded-2xl btn-primary-ritual text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send password reset email"
          >
            {processing ? 'Sending…' : 'Send Reset Link'}
          </button>
          <Link
            to="/login"
            className="px-4 h-12 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-secondary border border-card-border text-secondary hover:text-primary hover:border-accent-primary/30 text-sm font-bold hover:shadow-[0_0_15px_var(--accent-glow)] active:scale-95 transition-all duration-300"
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
