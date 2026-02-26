
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
        <h2 className="text-3xl font-serif text-primary font-bold">Subconscious Reframer</h2>
        <p className="text-muted text-sm mt-2 italic">Shed the outdated scripts and authorize a new identity.</p>
      </div>

      <div className="glass-card p-8 rounded-[2rem] space-y-6">
        <label className="text-sm uppercase tracking-[0.3em] text-muted font-bold">The Limiting Narrative</label>>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="I will never have enough... I am not ready..."
          className="w-full bg-card border border-card-border rounded-[1.5rem] p-6 text-primary focus:outline-none focus:ring-2 focus:ring-accent-border-subtle min-h-[120px] transition-all placeholder-muted"
        />
        <button
          onClick={handleReframe}
          disabled={loading || !input.trim()}
          className="w-full py-5 rounded-[1.5rem] btn-primary-ritual font-bold transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? 'Transmuting Neural Circuitry...' : 'Authorize Transformation'}
        </button>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm uppercase tracking-[0.3em] text-muted font-bold px-4">Evolution Archive</h3>
        {state.beliefs.map((b) => (
          <div key={b.id} className="glass-card p-7 rounded-[2rem] border-l-4 border-accent-primary transition-all hover:bg-secondary">
            <div className="text-sm text-muted line-through mb-2 italic">"{b.original}"</div>
            <div className="text-xl font-medium text-primary leading-relaxed">"{b.reframed}"</div>
            <div className="flex items-center gap-2 mt-4">
               <div className="h-px bg-card-border flex-1"></div>
               <div className="text-sm text-muted uppercase tracking-widest font-bold whitespace-nowrap">Reframed {new Date(b.timestamp).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
        {state.beliefs.length === 0 && (
          <div className="text-center text-muted py-16 px-8 border-2 border-dashed border-card-border rounded-[2rem] italic text-sm">No transformations logged. Expose a shadow above.</div>
        )}
      </div>
    </div>
  );
};

export default BeliefReframer;
