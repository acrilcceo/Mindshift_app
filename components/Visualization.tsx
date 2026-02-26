
import React, { useState } from 'react';
import { AppState, WhisperGoal } from '../src/types';

interface VisualizationProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

const Visualization: React.FC<VisualizationProps> = ({ state, onUpdate }) => {
  const [activeMode, setActiveMode] = useState<'whisper' | 'release'>('whisper');
  
  // Whisper Technique Form State
  const [whisperForm, setWhisperForm] = useState({ text: '', target: '' });
  const [showErrors, setShowErrors] = useState(false);
  
  // Thought Release Animation
  const [burningThought, setBurningThought] = useState('');
  const [isBurning, setIsBurning] = useState(false);

  const startWhisper = () => {
    if (!whisperForm.text.trim() || !whisperForm.target.trim()) {
      setShowErrors(true);
      return;
    }
    
    const newWhisper: WhisperGoal = {
      id: crypto.randomUUID(),
      text: whisperForm.text,
      targetPerson: whisperForm.target,
      timestamp: Date.now()
    };
    
    onUpdate({ whisperGoals: [newWhisper, ...state.whisperGoals] });
    setWhisperForm({ text: '', target: '' });
    setShowErrors(false);
    alert("Whisper recorded. Close your eyes and visualize whispering this into their ear while they sleep...");
  };

  const handleBurn = () => {
    if (!burningThought.trim()) return;
    setIsBurning(true);
    setTimeout(() => {
      setIsBurning(false);
      setBurningThought('');
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex p-1 rounded-2xl bg-secondary">
        {(['whisper', 'release'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
            setActiveMode(tab);
            setShowErrors(false);
          }}
          className={`flex-1 py-3 rounded-xl text-sm uppercase tracking-widest font-semibold transition-all ${
            activeMode === tab
              ? 'bg-card text-primary shadow-md'
              : 'text-muted hover:text-primary'
          }`}
        >
          {tab === 'whisper' ? 'Whisper Technique' : 'Thought Release'}
        </button>
        ))}
      </div>

      {activeMode === 'whisper' && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
          <div className="text-center px-4">
            <h3 className="text-xl font-serif text-primary">The Whisper Method</h3>
            <p className="text-sm mt-1 tracking-widest uppercase italic text-muted">
              Manifest communication through subconscious connection.
            </p>
          </div>

          <div className="glass-card p-8 rounded-[2rem] space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex justify-between text-sm uppercase tracking-widest font-bold">
                  <span className="text-secondary">Target Person *</span>
                  {showErrors && !whisperForm.target.trim() && (
                    <span className="text-error lowercase font-normal">Required</span>
                  )}
                </label>
                <input 
                  value={whisperForm.target} 
                  onChange={e => {
                    setWhisperForm({...whisperForm, target: e.target.value});
                    if (e.target.value.trim()) setShowErrors(false);
                  }}
                  placeholder="Who are you connecting with?" 
                  className={`w-full bg-card border border-card-border rounded-xl p-4 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 placeholder-muted transition-all ${
                    showErrors && !whisperForm.target.trim() ? 'border-error ring-error/20' : ''
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className="flex justify-between text-sm uppercase tracking-widest font-bold">
                  <span className="text-secondary">Your Message *</span>
                  {showErrors && !whisperForm.text.trim() && (
                    <span className="text-error lowercase font-normal">Required</span>
                  )}
                </label>
                <textarea 
                  value={whisperForm.text} 
                  onChange={e => {
                    setWhisperForm({...whisperForm, text: e.target.value});
                    if (e.target.value.trim()) setShowErrors(false);
                  }}
                  placeholder="What is the subconscious message?" 
                  className={`w-full bg-card border border-card-border rounded-2xl p-4 text-sm text-primary min-h-[100px] focus:outline-none focus:ring-2 focus:ring-accent-primary/50 placeholder-muted transition-all ${
                    showErrors && !whisperForm.text.trim() ? 'border-error ring-error/20' : ''
                  }`}
                />
              </div>
            </div>
            <button 
              onClick={startWhisper}
              className="w-full py-4 rounded-2xl btn-primary-ritual font-semibold"
            >
              Anchor Connection
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm uppercase tracking-widest text-muted font-bold px-4">
              Guided Visualization
            </h4>
            <div className="glass-card p-6 rounded-3xl text-sm italic text-secondary">
              1. Close your eyes and take 3 deep breaths.<br/><br/>
              2. Imagine {whisperForm.target || 'the target'} sleeping peacefully in a room filled with golden light.<br/><br/>
              3. Walk up to them and gently whisper your message into their ear. See them smile in their sleep.<br/><br/>
              4. Trust that the message has been delivered.
            </div>
          </div>
        </div>
      )}

      {activeMode === 'release' && (
        <div className="space-y-10 animate-in slide-in-from-left-4 flex flex-col items-center">
          <div className="text-center px-4">
            <h3 className="text-xl font-serif text-primary">Neural Purgation</h3>
            <p className="text-sm mt-1 tracking-widest uppercase italic text-muted">
              Write your shadow, then watch it turn to ash.
            </p>
          </div>

          <div className="relative w-full max-w-sm flex flex-col items-center">
            {isBurning ? (
              <div className="w-full h-64 flex items-center justify-center relative">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-7xl animate-bounce">🔥</div>
                 </div>
                 <div className="relative text-sm font-medium text-muted/50 italic animate-pulse line-through decoration-error/50 blur-[2px] transition-all duration-[3000ms] opacity-0">
                    {burningThought}
                 </div>
                 <div className="absolute bottom-0 text-sm uppercase tracking-[0.3em] text-error animate-pulse">Releasing Neural Pathways...</div>
              </div>
            ) : (
              <div className="w-full space-y-6">
                <textarea 
                  value={burningThought}
                  onChange={e => setBurningThought(e.target.value)}
                  placeholder="I am not good enough... (Enter the shadow thought)"
                  className="w-full bg-card border-2 border-dashed border-error/25 rounded-3xl p-6 text-sm text-primary min-h-[150px] focus:outline-none focus:border-error/50 placeholder-muted transition-all"
                />
                <button 
                  onClick={handleBurn}
                  disabled={!burningThought.trim()}
                  className="w-full py-4 rounded-2xl btn-primary-ritual disabled:opacity-40"
                >
                  Sacrifice to the Flame
                </button>
              </div>
            )}
          </div>

          <div className="max-w-xs text-center">
            <p className="text-sm text-muted leading-relaxed">
              Symbolic release helps detach the emotional charge from limiting beliefs. Once burned, do not dwell on the thought. It no longer belongs to you.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualization;
