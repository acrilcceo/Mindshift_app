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
    <div className="soundshift-atmosphere space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold" style={{ color: '#2F3A4A', letterSpacing: '0.03em' }}>
            SoundShift Studio
          </h2>
          <p className="body-sm mt-1" style={{ color: '#566074' }}>
            Regulate your state through sound and subtle frequency.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs" style={{ color: '#6B7280' }}>Today</div>
          <div className="text-3xl font-semibold" style={{ color: '#C6A96E' }}>
            {totalMinutesToday} min
          </div>
          <div className="text-[11px] mt-1" style={{ color: '#9CA3AF' }}>Listening</div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-[2rem] border-slate-200/70 dark:border-white/5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: '#EEF2F5' }}>
        <div>
          <div className="text-[11px] font-semibold tracking-wide" style={{ color: '#5E6C9E' }}>
            Last sound
          </div>
          <div className="text-base sm:text-lg mt-1 font-semibold" style={{ color: '#2F3A4A' }}>
            {lastMix ? lastMix.name : 'No mix played yet'}
          </div>
          <div className="text-[11px] mt-1" style={{ color: '#6B7280' }}>
            Tap a tile below to build a calming or focusing soundscape.
          </div>
        </div>
        <button
          type="button"
          className="px-5 py-3 rounded-full text-xs font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-40"
          style={{ backgroundColor: '#A8C3B8', color: '#2F3A4A' }}
          disabled={!lastMix}
        >
          Quick Resume
        </button>
      </div>

      <div className="glass-card p-6 rounded-[2rem] border-slate-200/70 dark:border-white/5" style={{ backgroundColor: '#F4F6F8' }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm font-semibold" style={{ color: '#2F3A4A' }}>How are you feeling?</div>
            <p className="text-[11px] mt-1" style={{ color: '#6B7280' }}>Select an emotional state to see suggested sound patterns.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {emotionalStates.map(es => (
            <button
              key={es.id}
              type="button"
              onClick={() => handleSelectEmotionalState(es.id)}
              className="soundshift-chip"
            >
              {es.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-semibold" style={{ color: '#2F3A4A' }}>Sound Palette</h3>
          <span className="text-[11px]" style={{ color: '#6B7280' }}>Frequencies • Binaural • Nature • Tones</span>
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
      className={`soundshift-tile relative group aspect-[4/3] flex flex-col justify-between p-4 border ${
        active ? 'soundshift-tile-active' : ''
      }`}
    >
      <div className="relative z-10">
        <div className="text-xs mb-1" style={{ color: '#E5E7EB' }}>{tag}</div>
        <div className="text-lg font-semibold" style={{ color: '#F9FAFB' }}>{label}</div>
      </div>
      <div className="relative z-10 flex items-end justify-between mt-3">
        <div className="flex items-center gap-1 text-[10px]" style={{ color: '#E5F3EC' }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#B8E3D4' }} />
          <span>∞ loop</span>
        </div>
        <div className="soundshift-wave">
          <span className="soundshift-wave-bar" />
          <span className="soundshift-wave-bar" />
          <span className="soundshift-wave-bar" />
          <span className="soundshift-wave-bar" />
          <span className="soundshift-wave-bar" />
        </div>
      </div>
    </button>
  );
};

export default SoundShiftStudio;
