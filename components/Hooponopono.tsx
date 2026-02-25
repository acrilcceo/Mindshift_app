
import React, { useState, useEffect, useRef } from 'react';
import { generateEmotionalReleasePrompt } from '../services/affirmationEngine';
import { AppState, BreathingSession } from '../types';

interface HooponoponoProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

type BreathingPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Prepare';

const Hooponopono: React.FC<HooponoponoProps> = ({ state, onUpdate }) => {
  const [prompt, setPrompt] = useState('Breathe in peace, exhale tension.');
  const [loading, setLoading] = useState(false);

  const [inhaleInput, setInhaleInput] = useState('4');
  const [holdInput, setHoldInput] = useState('4');
  const [exhaleInput, setExhaleInput] = useState('4');

  const parseDuration = (value: string, min: number) => {
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < min) return min;
    return num;
  };

  const inhaleTime = parseDuration(inhaleInput, 1);
  const holdTime = parseDuration(holdInput, 1);
  const exhaleTime = parseDuration(exhaleInput, 1);

  // Timer, Phase, Cycle & Session Duration State
  const [phase, setPhase] = useState<BreathingPhase>('Prepare');
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [totalSessionSeconds, setTotalSessionSeconds] = useState(0);

  // Use any to avoid NodeJS.Timeout namespace errors in browser environments
  const timerRef = useRef<any>(null);
  const stopwatchRef = useRef<any>(null);

  // Fetch AI prompt based on mood
  const fetchPrompt = async () => {
    const lastMood = state.moodHistory[state.moodHistory.length - 1]?.mood || 'Balanced';
    setLoading(true);
    try {
      const p = await generateEmotionalReleasePrompt(lastMood);
      setPrompt(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompt();
  }, []);

  // Stopwatch Logic (Total Session Time)
  useEffect(() => {
    if (timerStatus === 'running' && phase !== 'Prepare') {
      stopwatchRef.current = setInterval(() => {
        setTotalSessionSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    }
    return () => { if (stopwatchRef.current) clearInterval(stopwatchRef.current); };
  }, [timerStatus, phase]);

  // Main Breathing Logic
  useEffect(() => {
    if (timerStatus === 'running') {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Switch phases
            if (phase === 'Prepare') {
              setPhase('Inhale');
              return inhaleTime;
            } else if (phase === 'Inhale') {
              if (holdTime > 0) {
                setPhase('Hold');
                return holdTime;
              } else {
                setPhase('Exhale');
                return exhaleTime;
              }
            } else if (phase === 'Hold') {
              setPhase('Exhale');
              return exhaleTime;
            } else if (phase === 'Exhale') {
              setCyclesCompleted(c => c + 1);
              setPhase('Inhale');
              return inhaleTime;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerStatus, phase, inhaleTime, holdTime, exhaleTime]);

  const handleStart = () => {
    if (timerStatus === 'idle') {
      setPhase('Prepare');
      setSecondsRemaining(3); 
      setCyclesCompleted(0);
      setTotalSessionSeconds(0);
    }
    setTimerStatus('running');
  };

  const handlePause = () => {
    setTimerStatus('paused');
  };

  const handleReset = () => {
    if (cyclesCompleted > 0) {
      const newSession: BreathingSession = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        durationSeconds: totalSessionSeconds,
        cycles: cyclesCompleted
      };
      onUpdate({ breathingSessions: [newSession, ...state.breathingSessions] });
    }
    setTimerStatus('idle');
    setPhase('Prepare');
    setSecondsRemaining(0);
    setCyclesCompleted(0);
    setTotalSessionSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const clearHistory = () => {
    if (confirm("Permanently erase your breathing history?")) {
      onUpdate({ breathingSessions: [] });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // UI Visual Helpers
  const getScaleClass = () => {
    if (timerStatus === 'idle') return 'scale-90 opacity-20';
    if (phase === 'Inhale') return 'scale-125 opacity-50';
    if (phase === 'Hold') return 'scale-125 opacity-40';
    if (phase === 'Exhale') return 'scale-75 opacity-20';
    return 'scale-100 opacity-30';
  };

  const getPhaseColor = () => {
    if (phase === 'Inhale') return 'text-accent-primary';
    if (phase === 'Hold') return 'text-accent-secondary';
    if (phase === 'Exhale') return 'text-accent-primary'; // Using primary for exhale too for consistency
    return 'text-muted';
  };

  const defaultMantra = "I am sorry.\n\nPlease forgive me.\n\nThank you.\n\nI love you.";
  const [mantra, setMantra] = useState<string>(defaultMantra);
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(108);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [askFeeling, setAskFeeling] = useState<boolean>(false);
  const [feelingResponse, setFeelingResponse] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [hapticsOn, setHapticsOn] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const touchXRef = useRef<number | null>(null);

  const handleTapCount = () => {
    setCount(c => c + 1);
  };

  const playBeadClick = () => {
    try {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AC();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 900;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.045, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
    }
  };

  const handleMalaTap = () => {
    handleTapCount();
    if (soundOn) {
      playBeadClick();
    }
    if (hapticsOn && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleMalaKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
      e.preventDefault();
      handleMalaTap();
    }
  };

  const handleMalaTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      touchXRef.current = e.touches[0].clientX;
    }
  };

  const handleMalaTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    const x = e.touches[0].clientX;
    if (touchXRef.current === null) {
      touchXRef.current = x;
      return;
    }
    const delta = Math.abs(x - touchXRef.current);
    if (delta > 24) {
      touchXRef.current = x;
      handleMalaTap();
    }
  };

  const handleResetChant = () => {
    setCount(0);
    setMantra(defaultMantra);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
    setAskFeeling(true);
    setFeelingResponse(null);
  };

  const handleFeeling = (choice: 'better' | 'neutral') => {
    setAskFeeling(false);
    if (choice === 'better') {
      setFeelingResponse("Beautiful. Keep this warmth with you. You are supported.");
    } else {
      setFeelingResponse("You are not alone. Breathe gently and be kind to yourself.");
    }
  };

  const safeCount = Math.min(count, target);
  const beads = Array.from({ length: target }, (_, i) => i);
  const activeIndex = safeCount === 0 ? 0 : Math.min(safeCount, target - 1);
  const isComplete = safeCount >= target;

  return (
    <div className="flex flex-col items-center space-y-8 py-10 animate-in fade-in duration-1000">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif text-primary">Frequency Alignment</h2>
        <div className="flex items-center justify-center gap-3 mt-1">
          <p className="text-[10px] tracking-widest uppercase text-muted">Breathing Ritual</p>
          <span className="w-1 h-1 rounded-full bg-card-border"></span>
          <span className="text-[10px] font-mono text-accent-primary">{formatTime(totalSessionSeconds)}</span>
        </div>
      </div>

      {/* Breathing Guide Circle */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        <div 
          className={`absolute inset-0 rounded-full bg-accent-primary/10 transition-all ease-in-out ${getScaleClass()}`}
          style={{ 
            transitionDuration: phase === 'Inhale' ? `${inhaleTime}s` : phase === 'Exhale' ? `${exhaleTime}s` : '1s'
          }}
        ></div>
        <div 
          className={`absolute inset-0 rounded-full border border-accent-primary/20 transition-all ease-in-out ${getScaleClass()}`}
          style={{ 
            transitionDuration: phase === 'Inhale' ? `${inhaleTime}s` : phase === 'Exhale' ? `${exhaleTime}s` : '1s'
          }}
        ></div>
        
        <div className="z-10 text-center space-y-1">
          <div className={`text-2xl font-bold tracking-widest transition-colors duration-500 ${getPhaseColor()}`}>
            {timerStatus === 'idle' ? 'Ready?' : phase === 'Prepare' ? 'Get Ready' : phase}
          </div>
          {timerStatus !== 'idle' && (
            <>
              <div className="text-4xl font-mono font-bold auto-text">
                {secondsRemaining}s
              </div>
              <div className="text-[10px] text-muted uppercase tracking-widest font-bold mt-2">
                Cycle {cyclesCompleted + 1}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {timerStatus !== 'running' ? (
          <button 
            onClick={handleStart}
            className="px-8 py-3 rounded-2xl btn-primary-ritual font-bold transition-all shadow-lg active:scale-95"
          >
            {timerStatus === 'paused' ? 'Resume' : 'Start Session'}
          </button>
        ) : (
          <button 
            onClick={handlePause}
            className="px-8 py-3 rounded-2xl bg-card text-primary border border-card-border font-bold hover:bg-secondary transition-all shadow-lg active:scale-95"
          >
            Pause
          </button>
        )}
        <button 
          onClick={handleReset}
          className="px-6 py-3 rounded-2xl border border-card-border text-muted font-bold hover:text-primary transition-all active:scale-95"
        >
          {timerStatus === 'idle' ? 'Reset' : 'Finish Session'}
        </button>
      </div>

      {/* Configuration Section */}
      <div className="card-base p-6 rounded-3xl w-full max-w-sm border border-card-border space-y-4 shadow-xl">
        <h3 className="text-[10px] uppercase tracking-widest text-muted font-bold text-center">Customize Rhythm (Seconds)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] text-accent-primary/70 font-bold uppercase block text-center">Inhale</label>
            <input 
              type="text" 
              value={inhaleInput} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                if (value === '') {
                  setInhaleInput('');
                  return;
                }
                if (/^\d+$/.test(value)) {
                  setInhaleInput(value);
                }
              }}
              onBlur={() => {
                const num = parseInt(inhaleInput, 10);
                if (Number.isNaN(num) || num < 1) {
                  setInhaleInput('1');
                } else {
                  setInhaleInput(String(num));
                }
              }}
              className="w-full bg-secondary border border-card-border rounded-xl px-2 py-2 text-center text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-transparent"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-accent-secondary/70 font-bold uppercase block text-center">Hold</label>
            <input 
              type="text" 
              value={holdInput} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                if (value === '') {
                  setHoldInput('');
                  return;
                }
                if (/^\d+$/.test(value)) {
                  setHoldInput(value);
                }
              }}
              onBlur={() => {
                const num = parseInt(holdInput, 10);
                if (Number.isNaN(num) || num < 1) {
                  setHoldInput('1');
                } else {
                  setHoldInput(String(num));
                }
              }}
              className="w-full bg-secondary border border-card-border rounded-xl px-2 py-2 text-center text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent-secondary/40 focus:border-transparent"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-accent-primary/70 font-bold uppercase block text-center">Exhale</label>
            <input 
              type="text" 
              value={exhaleInput} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                if (value === '') {
                  setExhaleInput('');
                  return;
                }
                if (/^\d+$/.test(value)) {
                  setExhaleInput(value);
                }
              }}
              onBlur={() => {
                const num = parseInt(exhaleInput, 10);
                if (Number.isNaN(num) || num < 1) {
                  setExhaleInput('1');
                } else {
                  setExhaleInput(String(num));
                }
              }}
              className="w-full bg-secondary border border-border rounded-xl px-2 py-2 text-center text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Ritual Text */}
      <div className="card-base p-8 rounded-[2rem] max-w-sm w-full text-center space-y-8 border border-accent-primary/10 shadow-2xl">
        <div className="space-y-4 text-sm font-medium tracking-wide text-primary whitespace-pre-line">
          {mantra}
        </div>

        <div className="h-px bg-border w-full"></div>

        <div className="text-xs text-muted italic leading-relaxed px-4 min-h-[40px] flex items-center justify-center">
          {loading ? 'Aligning frequencies...' : prompt}
        </div>

        <div className={`mt-6 space-y-4 flex flex-col items-center ${isComplete ? 'mala-shell-complete' : ''}`}>
          <div
            className="mala-shell"
            onClick={handleMalaTap}
            onKeyDown={handleMalaKeyDown}
            onTouchStart={handleMalaTouchStart}
            onTouchMove={handleMalaTouchMove}
            tabIndex={0}
            role="button"
            aria-label={`Tap to advance mala counter. Currently at ${safeCount} of ${target}.`}
          >
            <div className="mala-ring">
              {beads.map((_, i) => {
                const angle = (i / beads.length) * 360;
                const baseClass = 'mala-bead';
                const stateClass = isComplete
                  ? 'mala-bead-completed'
                  : i < safeCount
                    ? 'mala-bead-completed'
                    : i === activeIndex
                      ? 'mala-bead-current'
                      : '';
                return (
                  <div
                    key={i}
                    className={`${baseClass} ${stateClass}`}
                    style={{ transform: `rotate(${angle}deg) translate(0, -46%)` }}
                  />
                );
              })}
              <div className="mala-counter-core">
                <div
                  className="mala-counter-core-number"
                  aria-live="polite"
                  role="status"
                >
                  {safeCount}
                </div>
                <div className="mala-counter-core-sub">
                  of {target}
                </div>
                {isComplete && (
                  <div className="mt-2 text-[10px] tracking-widest uppercase text-helper">
                    Cycle Complete
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mala-controls">
            <button
              aria-label="Reset chant"
              onClick={handleResetChant}
              className="px-4 py-2 rounded-full bg-secondary border border-border text-[11px] text-primary font-medium active:scale-95 transition-theme"
            >
              Reset
            </button>
            <button
              type="button"
              aria-label={soundOn ? 'Disable bead sound' : 'Enable bead sound'}
              onClick={() => setSoundOn(v => !v)}
              className={`mala-toggle ${soundOn ? 'mala-toggle-active' : ''}`}
            >
              {soundOn ? '🔊' : '🔈'}
            </button>
            <button
              type="button"
              aria-label={hapticsOn ? 'Disable vibration' : 'Enable vibration'}
              onClick={() => setHapticsOn(v => !v)}
              className={`mala-toggle ${hapticsOn ? 'mala-toggle-active' : ''}`}
            >
              ☼
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              aria-label="Set target 50"
              className={`px-3 py-2 rounded-full text-[12px] ${
                target === 50
                  ? 'bg-accent-secondary text-white'
                  : 'bg-secondary text-primary border border-card-border'
              }`}
              onClick={() => setTarget(50)}
            >
              50
            </button>
            <button
              aria-label="Set target 108"
              className={`px-3 py-2 rounded-full text-[12px] ${
                target === 108
                  ? 'bg-accent-secondary text-white'
                  : 'bg-secondary text-primary border border-card-border'
              }`}
              onClick={() => setTarget(108)}
            >
              108
            </button>
            <input
              aria-label="Custom target"
              type="number"
              min={1}
              value={target}
              onChange={e => setTarget(Math.max(1, parseInt(e.target.value || '1')))}
              className="px-3 py-2 rounded-full bg-secondary border border-card-border text-[12px] text-center text-primary focus:outline-none focus:ring-2 focus:ring-accent-secondary/40 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-muted font-bold">Custom Mantra</label>
            <textarea
              aria-label="Mantra text"
              value={mantra}
              onChange={e => setMantra(e.target.value)}
              placeholder={defaultMantra}
              className="w-full bg-white/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-3 text-[12px] text-primary dark:text-gray-200 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-transparent"
            />
            <div className="text-[10px] text-muted">Paste any text (e.g., Maha Mrityunjaya Mantra) to chant.</div>
          </div>
        </div>

        {showConfetti && <div className="cleanse-overlay"></div>}

        {askFeeling && (
          <div className="mt-6 space-y-3">
            <div className="text-[12px] text-primary dark:text-gray-200">How are you feeling now?</div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleFeeling('better')}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black text-[12px] font-bold"
                aria-label="I am feeling better"
              >
                I am feeling better
              </button>
              <button
                onClick={() => handleFeeling('neutral')}
                className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-[12px] font-bold"
                aria-label="Still heavy"
              >
                Still heavy
              </button>
            </div>
          </div>
        )}

        {feelingResponse && (
          <div className="mt-4 text-[12px] text-teal-200">{feelingResponse}</div>
        )}
      </div>

      {/* Session History Section */}
      <div className="w-full max-w-sm space-y-4">
        <div className="flex justify-between items-center px-4">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400/70 font-bold">Session History</h3>
          {state.breathingSessions.length > 0 && (
            <button 
              onClick={clearHistory}
              className="text-[9px] uppercase tracking-widest text-gray-600 hover:text-red-500 transition-colors"
            >
              Clear Logs
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {state.breathingSessions.length === 0 ? (
            <div className="glass-card p-6 rounded-3xl text-center border-dashed border-subtle dark:border-white/5 opacity-80">
              <p className="text-[10px] text-muted uppercase tracking-widest">No sessions recorded yet.</p>
            </div>
          ) : (
            state.breathingSessions.map((session) => (
              <div key={session.id} className="glass-card p-4 rounded-2xl flex justify-between items-center border border-subtle dark:border-white/5 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-1">
                  <div className="text-[10px] text-muted dark:text-gray-400 font-mono">{formatTimestamp(session.timestamp)}</div>
                  <div className="text-xs text-primary dark:text-gray-200 font-medium">{session.cycles} {session.cycles === 1 ? 'Cycle' : 'Cycles'} Completed</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-teal-600 dark:text-teal-500 font-bold">Duration</div>
                  <div className="text-sm font-mono auto-text">{formatTime(session.durationSeconds)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Hooponopono;
