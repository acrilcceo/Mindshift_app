import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { checkUserIdAvailability, updateUserId } from '../services/userIdService';

const ProfileSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [current, setCurrent] = useState<string>('');
  const [generatedAt, setGeneratedAt] = useState<string>('');
  const [next, setNext] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = useMemo(() => /^[a-zA-Z0-9]{6,20}$/.test(next), [next]);

  useEffect(() => {
    (async () => {
      if (!currentUser || !db) return;
      const ref = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(ref);
      const data = snap.data() as any;
      setCurrent(data?.userId || '');
      setGeneratedAt(data?.userIdGeneratedAt ? new Date(data.userIdGeneratedAt.toMillis?.() || Date.now()).toLocaleString() : '');
    })();
  }, [currentUser]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!next || !valid) {
        setAvailable(null);
        return;
      }
      setChecking(true);
      try {
        const ok = await checkUserIdAvailability(next);
        if (!cancelled) setAvailable(ok);
      } catch (e: any) {
        if (!cancelled) setAvailable(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    const t = setTimeout(run, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [next, valid]);

  const save = async () => {
    setError(null);
    if (!currentUser || !valid || available !== true) return;
    setProcessing(true);
    try {
      await updateUserId(currentUser.uid, next);
      setCurrent(next);
      setNext('');
      setAvailable(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to update user ID');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-secondary font-bold">Profile Settings</div>
            <div className="text-sm text-primary font-semibold">User ID</div>
          </div>
          <span className="text-xs text-secondary">{generatedAt ? `Assigned: ${generatedAt}` : ''}</span>
        </div>
        <div className="mt-4">
          <div className="text-[12px] text-secondary">Current</div>
          <div className="text-sm font-bold text-primary">{current || 'Not set'}</div>
        </div>
        <div className="mt-6 space-y-2">
          <label className="label text-secondary">Change User ID</label>
          <input
            value={next}
            onChange={e => setNext(e.target.value)}
            placeholder="6–20 alphanumeric"
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[12px] text-primary focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-invalid={!valid}
          />
          <div className="text-[11px]">
            {!valid && next.length > 0 && <span className="text-red-600 dark:text-red-400">Invalid format.</span>}
            {valid && checking && <span className="text-secondary">Checking availability…</span>}
            {valid && available === true && <span className="text-green-700 dark:text-green-400">Available</span>}
            {valid && available === false && <span className="text-red-600 dark:text-red-400">Not available</span>}
          </div>
        </div>
        {error && <div role="alert" className="text-[12px] text-red-600 dark:text-red-400 mt-2">{error}</div>}
        <div className="mt-6 flex gap-3">
          <button
            onClick={save}
            disabled={!valid || available !== true || processing}
            className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-amber-500 text-white dark:text-black text-[12px] font-bold hover:opacity-90 active:scale-95 transition-theme focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            aria-label="Save User ID"
          >
            {processing ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => { setNext(''); setAvailable(null); }}
            className="px-6 py-3 rounded-2xl bg-white/60 dark:bg-white/10 text-secondary hover:bg-white active:scale-95 transition-theme"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
