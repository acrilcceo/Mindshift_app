
import React, { useState } from 'react';
import { reframeBelief } from '../services/affirmationEngine';
import { BeliefRecord, AppState } from '../types';

interface BeliefReframerProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

const BeliefReframer: React.FC<BeliefReframerProps> = ({ state, onUpdate }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReframe = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const reframed = await reframeBelief(input);
      const newRecord: BeliefRecord = {
        id: crypto.randomUUID(),
        original: input,
        reframed,
        timestamp: Date.now()
      };
      onUpdate({ beliefs: [newRecord, ...state.beliefs] });
      setInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center px-4">
        <h2 className="text-3xl font-serif text-slate-800 dark:text-amber-100 font-bold">Subconscious Reframer</h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-2 italic">Shed the outdated scripts and authorize a new identity.</p>
      </div>

      <div className="glass-card p-8 rounded-[2rem] space-y-6">
        <label className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold">The Limiting Narrative</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="I will never have enough... I am not ready..."
          className="w-full bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-[1.5rem] p-6 text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-h-[120px] transition-all"
        />
        <button
          onClick={handleReframe}
          disabled={loading || !input.trim()}
          className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold hover:shadow-xl hover:shadow-amber-500/20 transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? 'Transmuting Neural Circuitry...' : 'Authorize Transformation'}
        </button>
      </div>

      <div className="space-y-6">
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold px-4">Evolution Archive</h3>
        {state.beliefs.map((b) => (
          <div key={b.id} className="glass-card p-7 rounded-[2rem] border-l-4 border-amber-500 transition-all hover:bg-slate-50 dark:hover:bg-white/10">
            <div className="text-xs text-muted line-through mb-2 italic">"{b.original}"</div>
            <div className="text-xl font-medium text-slate-800 dark:text-amber-100 leading-relaxed">"{b.reframed}"</div>
            <div className="flex items-center gap-2 mt-4">
               <div className="h-px bg-slate-200 dark:bg-white/5 flex-1"></div>
               <div className="text-[9px] text-muted uppercase tracking-widest font-bold whitespace-nowrap">Reframed {new Date(b.timestamp).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
        {state.beliefs.length === 0 && (
          <div className="text-center text-muted py-16 px-8 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] italic text-sm">No transformations logged. Expose a shadow above.</div>
        )}
      </div>
    </div>
  );
};

export default BeliefReframer;
