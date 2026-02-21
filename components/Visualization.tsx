
import React, { useState } from 'react';
import { AppState, WhisperGoal } from '../types';

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
      <div className="flex p-1 rounded-2xl bg-[#EEF2F6] dark:bg-gray-900/60">
        {(['whisper', 'release'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveMode(tab);
              setShowErrors(false);
            }}
            className={`flex-1 py-3 rounded-xl text-[10px] uppercase tracking-widest font-semibold transition-all ${
              activeMode === tab
                ? 'bg-white text-heading-secondary shadow-md'
                : 'text-helper hover:text-body-main'
            }`}
          >
            {tab === 'whisper' ? 'Whisper Technique' : 'Thought Release'}
          </button>
        ))}
      </div>

      {activeMode === 'whisper' && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
          <div className="text-center px-4">
            <h3 className="text-xl font-serif text-heading-secondary">The Whisper Method</h3>
            <p className="text-[10px] mt-1 tracking-widest uppercase italic text-helper">
              Manifest communication through subconscious connection.
            </p>
          </div>

          <div className="glass-card card-elevated p-8 rounded-[2rem] space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                  <span className="text-heading-secondary">Target Person *</span>
                  {showErrors && !whisperForm.target.trim() && (
                    <span className="text-red-500 lowercase font-normal">Required</span>
                  )}
                </label>
                <input 
                  value={whisperForm.target} 
                  onChange={e => {
                    setWhisperForm({...whisperForm, target: e.target.value});
                    if (e.target.value.trim()) setShowErrors(false);
                  }}
                  placeholder="Who are you connecting with?" 
                  className={`input-soft rounded-xl text-sm ${
                    showErrors && !whisperForm.target.trim() ? 'input-soft-error' : ''
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                  <span className="text-heading-secondary">Your Message *</span>
                  {showErrors && !whisperForm.text.trim() && (
                    <span className="text-red-500 lowercase font-normal">Required</span>
                  )}
                </label>
                <textarea 
                  value={whisperForm.text} 
                  onChange={e => {
                    setWhisperForm({...whisperForm, text: e.target.value});
                    if (e.target.value.trim()) setShowErrors(false);
                  }}
                  placeholder="What is the subconscious message?" 
                  className={`input-soft rounded-2xl text-sm min-h-[100px] ${
                    showErrors && !whisperForm.text.trim() ? 'input-soft-error' : ''
                  }`}
                />
              </div>
            </div>
            <button 
              onClick={startWhisper}
              className="w-full py-4 rounded-2xl btn-whisper-anchor"
            >
              Anchor Connection
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest text-helper font-bold px-4">
              Guided Visualization
            </h4>
            <div className="glass-card guided-panel p-6 rounded-3xl text-xs italic">
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
            <h3 className="text-xl font-serif text-heading-secondary">Neural Purgation</h3>
            <p className="text-[10px] mt-1 tracking-widest uppercase italic text-helper">
              Write your shadow, then watch it turn to ash.
            </p>
          </div>

          <div className="relative w-full max-w-sm flex flex-col items-center">
            {isBurning ? (
              <div className="w-full h-64 flex items-center justify-center relative">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-7xl animate-bounce">🔥</div>
                 </div>
                 <div className="relative text-sm font-medium text-gray-400/50 italic animate-pulse line-through decoration-red-500/50 blur-[2px] transition-all duration-[3000ms] opacity-0">
                    {burningThought}
                 </div>
                 <div className="absolute bottom-0 text-[10px] uppercase tracking-[0.3em] text-red-500 animate-pulse">Releasing Neural Pathways...</div>
              </div>
            ) : (
              <div className="w-full space-y-6">
                <textarea 
                  value={burningThought}
                  onChange={e => setBurningThought(e.target.value)}
                  placeholder="I am not good enough... (Enter the shadow thought)"
                  className="w-full input-soft rounded-3xl border-2 border-dashed border-red-500/25 p-6 text-sm min-h-[150px]"
                />
                <button 
                  onClick={handleBurn}
                  disabled={!burningThought.trim()}
                  className="w-full py-4 rounded-2xl btn-ritual-amber disabled:opacity-40"
                >
                  Sacrifice to the Flame
                </button>
              </div>
            )}
          </div>

          <div className="max-w-xs text-center">
            <p className="text-[10px] text-helper leading-relaxed">
              Symbolic release helps detach the emotional charge from limiting beliefs. Once burned, do not dwell on the thought. It no longer belongs to you.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualization;
