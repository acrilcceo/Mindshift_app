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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" onClick={onClose} />
      <div ref={dialogRef} className="relative w-full max-w-xl glass-card p-6 rounded-3xl shadow-2xl border border-card-border transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 id="affirmationFormTitle" className="text-xl font-serif font-bold text-primary">Add Affirmation</h2>
          <button aria-label="Close" className="text-muted hover:text-error transition-colors" onClick={onClose}>✕</button>
        </div>
        {error && <div role="alert" className="mb-4 p-3 rounded-xl bg-error/10 text-error text-sm font-medium">{error}</div>}
        
        <div className="space-y-4">
          <div>
            <label className="text-sm uppercase tracking-[0.3em] text-muted font-bold block mb-2">Affirmation</label>
            <textarea
              ref={inputRef}
              aria-label="Affirmation text"
              value={text}
              onChange={e => setText(e.target.value)}
              minLength={10}
              maxLength={500}
              placeholder="I am..."
              className="w-full bg-secondary/50 border border-card-border rounded-2xl p-4 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 min-h-[120px] transition-shadow"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm uppercase tracking-[0.3em] text-muted font-bold block mb-2">Category</label>
              <select
                aria-label="Category"
                value={category}
                onChange={e => setCategory(e.target.value as AffirmationCategory)}
                className="w-full bg-secondary/50 border border-card-border rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-shadow appearance-none"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm uppercase tracking-[0.3em] text-muted font-bold block mb-2">Reminder</label>
              <select
                aria-label="Reminder frequency"
                value={frequency}
                onChange={e => setFrequency(e.target.value as ReminderFrequency)}
                className="w-full bg-secondary/50 border border-card-border rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-shadow appearance-none"
              >
                {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {frequency === 'Custom' && (
          <div className="mt-4">
            <div className="text-sm uppercase tracking-widest text-muted font-bold mb-2">Custom Days</div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Select custom days">
              {[0,1,2,3,4,5,6].map(d => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${customDays.includes(d) ? 'bg-accent-primary text-btn-primary shadow-lg shadow-accent-primary/20' : 'bg-secondary text-secondary hover:bg-secondary/80'}`}
                  aria-pressed={customDays.includes(d)}
                >
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-card-border text-secondary hover:bg-secondary/10 transition-colors font-medium text-sm">Cancel</button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl btn-primary-ritual text-btn-primary font-medium shadow-lg hover:shadow-accent-primary/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all"
            disabled={text.trim().length < 10 || text.trim().length > 500}
            aria-disabled={text.trim().length < 10 || text.trim().length > 500}
          >
            Save Affirmation
          </button>
        </div>
      </div>
    </div>
  );
};

export default AffirmationForm;
