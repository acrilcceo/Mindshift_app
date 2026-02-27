import React, { useEffect, useMemo, useState } from 'react';
import { AppState, EmotionalState, SoundMix } from '../types';
import { createDefault432RainMix } from '../services/soundLibrary';
import { startMixSession, endCurrentSession, soundEngine, getCurrentSession } from '../services/soundEngine';
import { applyPresetById } from '../services/soundMixEngine';

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
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionalState | null>(null);
  const [activeFrequency, setActiveFrequency] = useState<string | null>(null);
  const [activeAmbient, setActiveAmbient] = useState<string | null>(null);

  const totalMinutesToday = useMemo(() => {
    if (!state.soundPreferences) return 0;
    return Math.floor(state.soundPreferences.todayListeningMs / 60000);
  }, [state.soundPreferences]);

  const [listeningMinutes, setListeningMinutes] = useState(totalMinutesToday);

  useEffect(() => {
    setListeningMinutes(totalMinutesToday);
  }, [totalMinutesToday]);

  useEffect(() => {
    const update = () => {
      const baseMs = state.soundPreferences?.todayListeningMs ?? 0;
      const session = getCurrentSession();
      if (session) {
        const extra = Date.now() - session.startedAt;
        setListeningMinutes(Math.floor((baseMs + extra) / 60000));
      } else {
        setListeningMinutes(Math.floor(baseMs / 60000));
      }
    };

    update();
    const id = window.setInterval(update, 10000);
    return () => window.clearInterval(id);
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

  const handleSelectEmotionalState = async (value: EmotionalState) => {
    setSelectedEmotion(value);
    const existing = state.soundMixes && state.soundMixes[0];
    if (!existing) return;
    const updated: SoundMix = { ...existing, emotionalState: value };
    const mixes = [updated, ...state.soundMixes!.slice(1)];
    onUpdate({ soundMixes: mixes });

    const emotionPresetMap: Record<EmotionalState, string> = {
      anxiety: 'deep_rest',
      overthinking: 'focus',
      sadness: 'ground',
      melancholy: 'ground',
      panic: 'deep_rest',
      stress: 'focus'
    };

    const presetId = emotionPresetMap[value];
    if (presetId) {
      await applyPresetById(presetId);
      setActiveFrequency(null);
      setActiveAmbient(null);
    }
  };

  const handleFrequencyClick = async (hz: string) => {
    if (activeFrequency === hz) {
      await soundEngine.stopFrequency();
      setActiveFrequency(null);
      return;
    }
    await soundEngine.playFrequency(hz);
    setActiveFrequency(hz);
  };

  const handleAmbientClick = async (key: string) => {
    if (activeAmbient === key) {
      await soundEngine.stopAmbient();
      setActiveAmbient(null);
      return;
    }
    await soundEngine.toggleAmbient(key);
    setActiveAmbient(key);
  };

  const hasLastMix = Boolean(lastMix);
  const canQuickResume = hasLastMix && !isPlaying;

  const handleQuickResume = async () => {
    if (!lastMix || !canQuickResume) return;
    setActiveFrequency(null);
    setActiveAmbient(null);
    const session = await startMixSession(lastMix);
    const prefs = ensureSoundPreferences();
    onUpdate({
      soundPreferences: {
        ...prefs,
        lastPlayedMixId: lastMix.id,
        lastPlayedAt: session.startedAt
      }
    });
    setIsPlaying(true);
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
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-primary">
            SoundShift Studio
          </h2>
          <p className="text-sm mt-1 text-secondary">
            Regulate your state through sound and subtle frequency.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted">Today</div>
          <div className="text-3xl font-semibold text-primary">
            {listeningMinutes} min
          </div>
          <div className="text-sm mt-1 text-muted">Listening</div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-[2rem] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold tracking-wide text-secondary uppercase tracking-widest">
            Last sound
          </div>
          <div className="text-base sm:text-lg mt-1 font-semibold text-primary">
            {lastMix ? lastMix.name : 'No mix played yet'}
          </div>
          <div className="text-sm mt-1 text-secondary">
            Tap a tile below to build a calming or focusing soundscape.
          </div>
        </div>
        <button
          type="button"
          className="btn-primary-ritual px-5 py-3 rounded-full text-sm font-semibold text-btn-primary"
          disabled={!canQuickResume}
          onClick={handleQuickResume}
        >
          Quick Resume
        </button>
      </div>

      <div className="glass-card p-6 rounded-[2rem]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-sm font-semibold text-secondary uppercase tracking-widest">How are you feeling?</div>
            <p className="text-sm mt-1 text-secondary">Select an emotional state to see suggested sound patterns.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {emotionalStates.map(es => (
            <button
              key={es.id}
              type="button"
              onClick={() => handleSelectEmotionalState(es.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                selectedEmotion === es.id 
                  ? 'bg-accent-primary text-btn-primary border-accent-primary shadow-lg shadow-accent-primary/20' 
                  : 'bg-secondary text-secondary border-card-border hover:text-primary hover:border-accent-primary/50'
              }`}
            >
              {es.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1 mt-2">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-widest">Sound Palette</h3>
          <span className="text-sm text-muted">Frequencies • Binaural • Nature • Tones</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <SoundTile
            label="528 Hz"
            tag="For emotional balance"
            onClick={() => handleFrequencyClick('528')}
            active={activeFrequency === '528'}
          />
          <SoundTile
            label="432 Hz"
            tag="For grounding"
            onClick={() => handleFrequencyClick('432')}
            active={activeFrequency === '432'}
          />
          <SoundTile
            label="174 Hz"
            tag="For deep rest"
            onClick={() => handleFrequencyClick('174')}
            active={activeFrequency === '174'}
          />
          <SoundTile
            label="Rain"
            tag="For soft focus"
            onClick={() => handleAmbientClick('rain')}
            active={activeAmbient === 'rain'}
          />
          <SoundTile
            label="Ocean Waves"
            tag="For overthinking"
            onClick={() => handleAmbientClick('ocean')}
            active={activeAmbient === 'ocean'}
          />
          <SoundTile
            label="Forest"
            tag="For calm presence"
            onClick={() => handleAmbientClick('forest')}
            active={activeAmbient === 'forest'}
          />
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
        <div className="text-sm mb-1 soundshift-tile-subtitle">{tag}</div>
        <div className="text-lg font-semibold soundshift-tile-title">{label}</div>
      </div>
      <div className="relative z-10 flex items-end justify-between mt-3">
        <div className="flex items-center gap-1 text-sm text-muted">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-secondary" />
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
