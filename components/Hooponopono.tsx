
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
  
  // Custom Breathing Durations (seconds)
  const [inhaleTime, setInhaleTime] = useState(4);
  const [holdTime, setHoldTime] = useState(4);
  const [exhaleTime, setExhaleTime] = useState(4);

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
    if (phase === 'Inhale') return 'text-teal-300';
    if (phase === 'Hold') return 'text-amber-300';
    if (phase === 'Exhale') return 'text-blue-300';
    return 'text-gray-400';
  };

  return (
    <div className="flex flex-col items-center space-y-8 py-10 animate-in fade-in duration-1000">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif text-teal-100">Frequency Alignment</h2>
        <div className="flex items-center justify-center gap-3 mt-1">
          <p className="text-gray-500 text-[10px] tracking-widest uppercase">Breathing Ritual</p>
          <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
          <span className="text-[10px] font-mono text-teal-500/80">{formatTime(totalSessionSeconds)}</span>
        </div>
      </div>

      {/* Breathing Guide Circle */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        <div 
          className={`absolute inset-0 rounded-full bg-teal-500/10 transition-all ease-in-out ${getScaleClass()}`}
          style={{ 
            transitionDuration: phase === 'Inhale' ? `${inhaleTime}s` : phase === 'Exhale' ? `${exhaleTime}s` : '1s'
          }}
        ></div>
        <div 
          className={`absolute inset-0 rounded-full border border-teal-500/20 transition-all ease-in-out ${getScaleClass()}`}
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
              <div className="text-4xl font-mono text-white/80 font-bold">
                {secondsRemaining}s
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-2">
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
            className="px-8 py-3 rounded-2xl bg-teal-600 text-white font-bold hover:bg-teal-500 transition-all shadow-lg active:scale-95"
          >
            {timerStatus === 'paused' ? 'Resume' : 'Start Session'}
          </button>
        ) : (
          <button 
            onClick={handlePause}
            className="px-8 py-3 rounded-2xl bg-gray-800 text-gray-300 font-bold hover:bg-gray-700 transition-all shadow-lg active:scale-95"
          >
            Pause
          </button>
        )}
        <button 
          onClick={handleReset}
          className="px-6 py-3 rounded-2xl border border-white/10 text-gray-500 font-bold hover:text-white transition-all active:scale-95"
        >
          {timerStatus === 'idle' ? 'Reset' : 'Finish Session'}
        </button>
      </div>

      {/* Configuration Section */}
      <div className="glass-card p-6 rounded-3xl w-full max-w-sm border-white/5 space-y-4 shadow-xl">
        <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold text-center">Customize Rhythm (Seconds)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] text-teal-400/70 font-bold uppercase block text-center">Inhale</label>
            <input 
              type="number" 
              value={inhaleTime} 
              onChange={(e) => setInhaleTime(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-center text-sm focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-amber-400/70 font-bold uppercase block text-center">Hold</label>
            <input 
              type="number" 
              value={holdTime} 
              onChange={(e) => setHoldTime(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-center text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-blue-400/70 font-bold uppercase block text-center">Exhale</label>
            <input 
              type="number" 
              value={exhaleTime} 
              onChange={(e) => setExhaleTime(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-center text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Ritual Text */}
      <div className="glass-card p-8 rounded-[2rem] max-w-sm w-full text-center space-y-8 border-teal-500/10 shadow-2xl">
        <div className="space-y-4 text-sm font-medium tracking-wide text-gray-200">
          <p className="hover:text-teal-400 transition-colors cursor-default">I am sorry.</p>
          <p className="hover:text-teal-400 transition-colors cursor-default">Please forgive me.</p>
          <p className="hover:text-teal-400 transition-colors cursor-default">Thank you.</p>
          <p className="hover:text-teal-400 transition-colors cursor-default">I love you.</p>
        </div>

        <div className="h-px bg-white/5 w-full"></div>

        <div className="text-xs text-gray-400 italic leading-relaxed px-4 min-h-[40px] flex items-center justify-center">
          {loading ? 'Aligning frequencies...' : prompt}
        </div>
      </div>

      {/* Session History Section */}
      <div className="w-full max-w-sm space-y-4">
        <div className="flex justify-between items-center px-4">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-teal-400/70 font-bold">Session History</h3>
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
            <div className="glass-card p-6 rounded-3xl text-center border-dashed border-white/5 opacity-50">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">No sessions recorded yet.</p>
            </div>
          ) : (
            state.breathingSessions.map((session) => (
              <div key={session.id} className="glass-card p-4 rounded-2xl flex justify-between items-center border-white/5 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-400 font-mono">{formatTimestamp(session.timestamp)}</div>
                  <div className="text-xs text-gray-200 font-medium">{session.cycles} {session.cycles === 1 ? 'Cycle' : 'Cycles'} Completed</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-teal-500 font-bold">Duration</div>
                  <div className="text-sm font-mono text-white/80">{formatTime(session.durationSeconds)}</div>
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
