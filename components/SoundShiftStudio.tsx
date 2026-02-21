import React, { useMemo, useState } from 'react';
import { AppState, EmotionalState, SoundMix } from '../types';
import { createDefault432RainMix } from '../services/soundLibrary';
import { startMixSession, endCurrentSession } from '../services/soundEngine';

interface SoundShiftStudioProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

const emotionalStates: { id: EmotionalState; label: string }[] = [
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'overthinking', label: 'Overthinking' },
  { id: 'sadness', label: 'Sadness' },
  { id: 'melancholy', label: 'Melancholy' },
  { id: 'panic', label: 'Panic sensations' },
  { id: 'stress', label: 'Stress' }
];

const SoundShiftStudio: React.FC<SoundShiftStudioProps> = ({ state, onUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const totalMinutesToday = useMemo(() => {
    if (!state.soundPreferences) return 0;
    return Math.floor(state.soundPreferences.todayListeningMs / 60000);
  }, [state.soundPreferences]);

  const lastMix = useMemo<SoundMix | null>(() => {
    if (!state.soundPreferences || !state.soundMixes || !state.soundPreferences.lastPlayedMixId) return null;
    return state.soundMixes.find(m => m.id === state.soundPreferences!.lastPlayedMixId) || null;
  }, [state.soundPreferences, state.soundMixes]);

  const ensureSoundPreferences = () => {
    if (state.soundPreferences) return state.soundPreferences;
    return {
      todayListeningMs: 0,
      headphonePromptShown: false,
      batterySaver: false
    };
  };

  const handleSelectEmotionalState = (value: EmotionalState) => {
    const existing = state.soundMixes && state.soundMixes[0];
    if (!existing) return;
    const updated: SoundMix = { ...existing, emotionalState: value };
    const mixes = [updated, ...state.soundMixes!.slice(1)];
    onUpdate({ soundMixes: mixes });
  };

  const handleToggle432Rain = async () => {
    if (!isPlaying) {
      const defaultMix = createDefault432RainMix();
      const mixes = state.soundMixes || [];
      const existing = mixes.find(m => m.id === defaultMix.id);
      const mixToUse = existing || defaultMix;
      if (!existing) {
        onUpdate({ soundMixes: [mixToUse, ...mixes] });
      }
      const session = await startMixSession(mixToUse);
      const prefs = ensureSoundPreferences();
      onUpdate({
        soundPreferences: {
          ...prefs,
          lastPlayedMixId: mixToUse.id,
          lastPlayedAt: session.startedAt
        }
      });
      setIsPlaying(true);
      return;
    }

    const finished = await endCurrentSession();
    if (!finished) {
      setIsPlaying(false);
      return;
    }
    const durationMs = finished.durationMs || 0;
    const prefs = ensureSoundPreferences();
    const sessions = state.soundSessions || [];
    const analytics = state.soundAnalytics || {
      totalListeningMs: 0,
      frequencyUsageMs: {},
      emotionalUsageMs: {
        anxiety: 0,
        overthinking: 0,
        sadness: 0,
        melancholy: 0,
        panic: 0,
        stress: 0
      },
      sleepVsFocusMs: {
        sleep: 0,
        focus: 0
      }
    };

    const nextAnalytics = {
      ...analytics,
      totalListeningMs: analytics.totalListeningMs + durationMs,
      sleepVsFocusMs: {
        sleep: finished.usageMode === 'sleep' ? analytics.sleepVsFocusMs.sleep + durationMs : analytics.sleepVsFocusMs.sleep,
        focus: finished.usageMode === 'focus' ? analytics.sleepVsFocusMs.focus + durationMs : analytics.sleepVsFocusMs.focus
      }
    };

    onUpdate({
      soundSessions: [finished, ...sessions],
      soundPreferences: {
        ...prefs,
        todayListeningMs: prefs.todayListeningMs + durationMs
      },
      soundAnalytics: nextAnalytics
    });
    setIsPlaying(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-3xl sm:text-4xl font-serif text-slate-800 dark:text-amber-100 font-bold">SoundShift Studio</h2>
          <p className="text-secondary body-sm mt-1">Regulate your state through sound and subtle frequency.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-secondary">Today</div>
          <div className="text-3xl font-bold text-amber-500 dark:text-amber-400">{totalMinutesToday} min</div>
          <div className="label text-secondary mt-1">Listening</div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-[2rem] border-slate-200 dark:border-white/5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="label brand mb-1">Last Sound</div>
          <div className="text-base sm:text-lg text-primary font-semibold">
            {lastMix ? lastMix.name : 'No mix played yet'}
          </div>
          <div className="text-[11px] text-muted mt-1">
            Tap a tile below to build a calming or focusing soundscape.
          </div>
        </div>
        <button
          type="button"
          className="px-5 py-3 rounded-2xl bg-accent ensure-contrast text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-40"
          disabled={!lastMix}
        >
          Quick Resume
        </button>
      </div>

      <div className="glass-card p-6 rounded-[2rem] border-slate-200 dark:border-white/5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="label text-secondary">How are you feeling?</div>
            <p className="text-[11px] text-muted mt-1">Select an emotional state to see suggested sound patterns.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {emotionalStates.map(es => (
            <button
              key={es.id}
              type="button"
              onClick={() => handleSelectEmotionalState(es.id)}
              className="px-4 py-2 rounded-2xl bg-surface-soft dark:bg-white/5 text-[11px] font-bold uppercase tracking-widest text-secondary hover:text-primary hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
            >
              {es.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="label text-secondary">Sound Palette</h3>
          <span className="label brand">Frequencies • Binaural • Nature • Tones</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <SoundTile label="528 Hz" tag="For emotional balance" />
          <SoundTile label="432 Hz" tag="For grounding" onClick={handleToggle432Rain} active={isPlaying} />
          <SoundTile label="174 Hz" tag="For deep rest" />
          <SoundTile label="Rain" tag="For soft focus" />
          <SoundTile label="Ocean Waves" tag="For overthinking" />
          <SoundTile label="Forest" tag="For calm presence" />
        </div>
      </div>
    </div>
  );
};

interface SoundTileProps {
  label: string;
  tag: string;
  onClick?: () => void;
  active?: boolean;
}

const SoundTile: React.FC<SoundTileProps> = ({ label, tag, onClick, active }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative group overflow-hidden rounded-3xl aspect-[4/3] flex flex-col justify-between p-4 shadow-lg hover:shadow-xl transition-all ${
        active
          ? 'bg-emerald-500/20 border border-emerald-400/60 dark:border-emerald-300/70'
          : 'bg-slate-900/70 dark:bg-slate-900/80 border border-slate-700/60 dark:border-white/5'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-slate-900/40 to-emerald-500/10 pointer-events-none" />
      <div className="relative z-10">
        <div className="text-xs uppercase tracking-widest text-slate-300/80 mb-1">{tag}</div>
        <div className="text-lg font-semibold text-white">{label}</div>
      </div>
      <div className="relative z-10 flex items-end justify-between mt-3">
        <div className="flex items-center gap-1 text-[10px] text-slate-300">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>∞ loop</span>
        </div>
        <div className="flex gap-0.5 items-end h-5">
          <span className="w-0.5 bg-emerald-300/40 group-hover:bg-emerald-300/80 h-2 rounded-full transition-all" />
          <span className="w-0.5 bg-emerald-300/30 group-hover:bg-emerald-300/70 h-3 rounded-full transition-all" />
          <span className="w-0.5 bg-emerald-300/40 group-hover:bg-emerald-300/80 h-4 rounded-full transition-all" />
          <span className="w-0.5 bg-emerald-300/30 group-hover:bg-emerald-300/70 h-3 rounded-full transition-all" />
          <span className="w-0.5 bg-emerald-300/40 group-hover:bg-emerald-300/80 h-2 rounded-full transition-all" />
        </div>
      </div>
    </button>
  );
};

export default SoundShiftStudio;
