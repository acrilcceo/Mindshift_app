import React, { useEffect, useRef, useState } from 'react';
import { AffirmationCategory, ReminderFrequency, UserAffirmation } from '../types';
import { create, update } from '../services/affirmationService';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: UserAffirmation | null;
  onSaved: (a: UserAffirmation) => void;
}

const categories: AffirmationCategory[] = ['Gratitude', 'Self-Love', 'Success', 'Health', 'Relationships', 'Custom'];
const frequencies: ReminderFrequency[] = ['None', 'Daily', 'Weekly', 'Monthly', 'Custom'];

const AffirmationForm: React.FC<Props> = ({ open, onClose, editing, onSaved }) => {
  const [text, setText] = useState(editing?.text || '');
  const [category, setCategory] = useState<AffirmationCategory>(editing?.category || 'Custom');
  const [frequency, setFrequency] = useState<ReminderFrequency>(editing?.reminder.frequency || 'None');
  const [customDays, setCustomDays] = useState<number[]>(editing?.reminder.days || []);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(editing?.text || '');
    setCategory(editing?.category || 'Custom');
    setFrequency(editing?.reminder.frequency || 'None');
    setCustomDays(editing?.reminder.days || []);
    setError(null);
  }, [editing, open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const toggleDay = (d: number) => {
    if (customDays.includes(d)) setCustomDays(customDays.filter(x => x !== d));
    else setCustomDays([...customDays, d]);
  };

  const handleSave = () => {
    try {
      if (editing) {
        const next = update(editing.id, {
          text,
          category,
          reminder: { frequency, days: frequency === 'Custom' ? customDays : undefined }
        });
        onSaved(next);
      } else {
        const created = create(text, category, frequency, frequency === 'Custom' ? customDays : undefined);
        onSaved(created);
      }
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Error');
    }
  };

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="affirmationFormTitle"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div ref={dialogRef} className="relative w-[95%] max-w-xl glass-card p-6 rounded-3xl shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 id="affirmationFormTitle" className="text-lg font-serif text-slate-800 dark:text-amber-100">Add Affirmation</h2>
          <button aria-label="Close" className="text-muted hover:text-red-500" onClick={onClose}>✕</button>
        </div>
        {error && <div role="alert" className="mb-3 text-[12px] text-red-600 dark:text-red-400">{error}</div>}
        <label className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold">Affirmation</label>
        <textarea
          ref={inputRef}
          aria-label="Affirmation text"
          value={text}
          onChange={e => setText(e.target.value)}
          minLength={10}
          maxLength={500}
          placeholder="I am..."
          className="w-full bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-[1.5rem] p-4 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-h-[120px]"
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold">Category</label>
            <select
              aria-label="Category"
              value={category}
              onChange={e => setCategory(e.target.value as AffirmationCategory)}
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[12px]"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold">Reminder</label>
            <select
              aria-label="Reminder frequency"
              value={frequency}
              onChange={e => setFrequency(e.target.value as ReminderFrequency)}
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[12px]"
            >
              {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
        {frequency === 'Custom' && (
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-widest text-muted font-bold">Custom Days</div>
            <div className="flex flex-wrap gap-2 mt-2" role="group" aria-label="Select custom days">
              {[0,1,2,3,4,5,6].map(d => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`px-3 py-1 rounded-xl text-[12px] ${customDays.includes(d) ? 'bg-amber-500 text-black' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400'}`}
                  aria-pressed={customDays.includes(d)}
                >
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300">Cancel</button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold disabled:opacity-50"
            disabled={text.trim().length < 10 || text.trim().length > 500}
            aria-disabled={text.trim().length < 10 || text.trim().length > 500}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AffirmationForm;
