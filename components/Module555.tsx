
import React, { useState, useEffect } from 'react';
import { AppState, Module555 as Module555Type } from '../types';

interface Module555Props {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

const Module555: React.FC<Module555Props> = ({ state, onUpdate }) => {
  const [newAffirmation, setNewAffirmation] = useState('');
  
  const currentModule = state.module555;

  const startModule = () => {
    if (!newAffirmation.trim()) return;
    const module: Module555Type = {
      id: crypto.randomUUID(),
      affirmation: newAffirmation,
      currentDay: 1,
      progress: [0, 0, 0, 0, 0],
      isCompleted: false,
      startDate: Date.now()
    };
    onUpdate({ module555: module });
  };

  const handleRepetition = () => {
    if (!currentModule || currentModule.isCompleted) return;
    
    const dayIndex = currentModule.currentDay - 1;
    const newProgress = [...currentModule.progress];
    
    if (newProgress[dayIndex] < 55) {
      newProgress[dayIndex] += 1;
      
      let nextDay = currentModule.currentDay;
      let isDone = false;
      
      // If we finished the 55 for current day, we check if it's the 5th day
      if (newProgress[dayIndex] === 55) {
        if (currentModule.currentDay === 5) {
          isDone = true;
        } else {
          // In a real app we'd wait for the next calendar day, but for demo we allow progression
          nextDay += 1;
        }
      }

      onUpdate({ 
        module555: { 
          ...currentModule, 
          progress: newProgress,
          currentDay: nextDay,
          isCompleted: isDone
        } 
      });
    }
  };

  if (!currentModule) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-amber-100">5-5-5 Ritual</h2>
          <p className="text-gray-400 text-sm mt-1">Deep neural imprinting via massive repetition.</p>
        </div>
        <div className="glass-card p-8 rounded-3xl space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Your Core Intention</label>
            <textarea
              value={newAffirmation}
              onChange={(e) => setNewAffirmation(e.target.value)}
              placeholder="I am now a magnet for high-value opportunities..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <button
            onClick={startModule}
            className="w-full py-4 rounded-2xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
          >
            Commence 5-Day Ritual
          </button>
          <div className="text-[10px] text-gray-600 text-center leading-relaxed italic">
            "55 repetitions for 5 consecutive days anchors the belief in the subconscious."
          </div>
        </div>
      </div>
    );
  }

  const dailyProgress = currentModule.progress[currentModule.currentDay - 1];

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-serif text-amber-100">Day {currentModule.currentDay} / 5</h2>
        <div className="text-lg font-medium text-amber-500/80 mt-2 px-4 italic">"{currentModule.affirmation}"</div>
      </div>

      <div className="flex justify-center items-center py-10">
        <button
          onClick={handleRepetition}
          disabled={currentModule.isCompleted}
          className="w-40 h-40 rounded-full glass-card flex flex-col items-center justify-center ring-4 ring-amber-500/20 active:scale-95 transition-transform"
        >
          <span className="text-5xl font-bold text-amber-400">{dailyProgress}</span>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">Repetitions</span>
        </button>
      </div>

      <div className="glass-card p-6 rounded-3xl">
        <div className="flex justify-between mb-4">
          {[1, 2, 3, 4, 5].map(d => (
            <div key={d} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${currentModule.currentDay >= d ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-600'}`}>
                {d}
              </div>
              <div className="h-1 w-full bg-gray-800 mt-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${(currentModule.progress[d-1] / 55) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        {currentModule.isCompleted ? (
          <div className="text-center text-green-400 text-sm font-bold uppercase tracking-widest mt-4">
            Ritual Complete ✨ The seed is sown.
          </div>
        ) : (
          <div className="text-center text-gray-500 text-xs italic">
            Tap the counter as you whisper your intention.
          </div>
        )}
      </div>

      <button 
        onClick={() => onUpdate({ module555: null })}
        className="text-[10px] uppercase tracking-widest text-gray-600 hover:text-red-500 block mx-auto transition-colors"
      >
        Reset Module
      </button>
    </div>
  );
};

export default Module555;
