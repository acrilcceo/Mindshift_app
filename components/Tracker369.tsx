
import React, { useState } from 'react';
import { AppState, Tracker369 as Tracker369Type } from '../types';

interface Tracker369Props {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

const Tracker369: React.FC<Tracker369Props> = ({ state, onUpdate }) => {
  const todayStr = new Date().toDateString();
  const currentEntry = state.tracker369.find(e => e.date === todayStr) || {
    date: todayStr,
    morning: [],
    afternoon: [],
    night: []
  };

  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'morning' | 'afternoon' | 'night'>('morning');

  const addAffirmation = () => {
    if (!input.trim()) return;
    
    const limit = activeTab === 'morning' ? 3 : activeTab === 'afternoon' ? 6 : 9;
    if (currentEntry[activeTab].length >= limit) return;

    const newEntry = { ...currentEntry, [activeTab]: [...currentEntry[activeTab], input] };
    const newTracker = [...state.tracker369.filter(e => e.date !== todayStr), newEntry];
    
    onUpdate({ tracker369: newTracker });
    setInput('');
  };

  const progress = (
    (currentEntry.morning.length + currentEntry.afternoon.length + currentEntry.night.length) / 18
  ) * 100;

  return (
    <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
      <div className="text-center px-4">
        <h2 className="text-3xl font-serif text-slate-800 dark:text-blue-100 font-bold">3-6-9 Harmonic Alignment</h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-2 italic">Master the frequency of manifestation via rhythmic journaling.</p>
      </div>

      <div className="glass-card p-6 rounded-[2rem]">
        <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-muted mb-3 font-bold">
          <span>Daily Resonance</span>
          <span>{Math.round(progress)}% Focused</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex bg-surface-soft dark:bg-gray-900/50 p-1.5 rounded-2xl border border-subtle dark:border-white/10">
        {(['morning', 'afternoon', 'night'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === tab ? 'bg-accent ensure-contrast shadow-md shadow-emerald-500/20' : 'text-muted hover:text-primary dark:hover:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="glass-card p-8 rounded-[2rem] space-y-6">
        <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-muted font-bold">
          <span className="accent">{activeTab} Transmission</span>
          <span className="bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">{currentEntry[activeTab].length} / {activeTab === 'morning' ? 3 : activeTab === 'afternoon' ? 6 : 9}</span>
        </div>
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={currentEntry[activeTab].length >= (activeTab === 'morning' ? 3 : activeTab === 'afternoon' ? 6 : 9)}
            placeholder={`Whisper your ${activeTab} reality...`}
            className="flex-1 bg-white/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && addAffirmation()}
          />
          <button 
            onClick={addAffirmation}
            className="bg-accent ensure-contrast px-6 rounded-2xl hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 font-bold"
          >
            +
          </button>
        </div>

        <div className="space-y-3 mt-8 max-h-[350px] overflow-y-auto no-scrollbar">
          {currentEntry[activeTab].map((text, i) => (
            <div key={i} className="bg-white/40 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/5 text-sm text-slate-700 dark:text-gray-300 animate-in fade-in slide-in-from-left-2 transition-all hover:border-indigo-500/30">
              {text}
            </div>
          ))}
          {currentEntry[activeTab].length === 0 && (
            <div className="text-center text-slate-400 dark:text-gray-600 py-10 text-xs italic tracking-wide">Enter the first spark of your {activeTab} frequency.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tracker369;
