
import React, { useState, useEffect, useMemo } from 'react';
import { generateAffirmations } from '../services/affirmationEngine';
import { Mood, AppState } from '../types';
import MyAffirmations from './MyAffirmations';

interface DashboardProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

const MOOD_VALUES: Record<Mood, number> = {
  'Radiant': 5,
  'Balanced': 4,
  'Quiet': 3,
  'Challenged': 2,
  'Heavy': 1
};

const Dashboard: React.FC<DashboardProps> = ({ state, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [affirmationIndex, setAffirmationIndex] = useState(0);

  useEffect(() => {
    if (!state.dailyAffirmation) {
      handleRefreshAffirmations();
    }
  }, []);

  const handleRefreshAffirmations = async () => {
    setLoading(true);
    try {
      const mood = state.moodHistory.find(h => h.date === new Date().toDateString())?.mood || 'Balanced';
      const recentGratitude = state.gratitudeList.slice(0, 3).join('. ');
      const recentBeliefs = state.beliefs.slice(0, 3).map(b => b.reframed).join('. ');
      const recentActions = state.ftbaEntries.slice(0, 3).map(e => e.action).join('. ');
      
      const context = [
        recentGratitude ? `Focuses of Gratitude: ${recentGratitude}` : '',
        recentBeliefs ? `Reframed Empowering Beliefs: ${recentBeliefs}` : '',
        recentActions ? `Intended Neural Actions: ${recentActions}` : ''
      ].filter(Boolean).join('; ');

      const affirmations = await generateAffirmations(mood, context);
      onUpdate({ dailyAffirmation: affirmations });
      setAffirmationIndex(0);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (mood: Mood) => {
    const today = new Date().toDateString();
    const newHistory = [...state.moodHistory.filter(h => h.date !== today), { date: today, mood }];
    onUpdate({ moodHistory: newHistory });
  };

  const currentMood = state.moodHistory.find(h => h.date === new Date().toDateString())?.mood;

  const calculateVibrationScore = () => {
    let score = state.streak * 5;
    score += state.beliefs.length * 2;
    score += state.ftbaEntries.length * 3;
    score += state.gratitudeList.length;
    score += state.breathingSessions.length * 2;
    score += state.whisperGoals.length * 5;
    return Math.min(score, 100);
  };

  // 30-Day Mood Chart Logic
  const chartData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const entry = state.moodHistory.find(h => h.date === dateStr);
      days.push({
        label: d.getDate(),
        value: entry ? MOOD_VALUES[entry.mood] : 3, // Default to neutral 'Quiet' if no data
        hasData: !!entry
      });
    }
    return days;
  }, [state.moodHistory]);

  const moodChartSvg = useMemo(() => {
    const width = 500;
    const height = 100;
    const padding = 10;
    const points = chartData.map((d, i) => ({
      x: (i / (chartData.length - 1)) * (width - 2 * padding) + padding,
      y: height - ((d.value - 1) / 4) * (height - 2 * padding) - padding
    }));

    const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { pathD, areaD, points };
  }, [chartData]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-4xl font-serif text-slate-800 dark:text-amber-100 font-bold">Today's Focus</h2>
          <p className="text-secondary body-sm mt-1">Aligning your frequency for peak potential.</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-amber-500 dark:text-amber-400 drop-shadow-sm">{state.streak}</div>
          <div className="label text-secondary mt-1">Day Streak</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass-card p-8 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 border-blue-500/10 dark:border-blue-500/20 shadow-xl dark:shadow-none">
          <div className="text-center sm:text-left">
            <h3 className="label brand">Vibration Index</h3>
            <p className="body-sm text-muted mt-1">Holistic consistency score</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-4xl font-bold text-primary">{calculateVibrationScore()}%</div>
            <div className="w-24 h-2 bg-white/60 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${calculateVibrationScore()}%` }}></div>
            </div>
          </div>
        </div>

        {/* Mood History Chart */}
        <div className="glass-card p-6 rounded-[2rem] border-slate-200 dark:border-white/5">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="label text-secondary">30-Day Frequency Trend</h3>
            <span className="label brand">Emotional Arc</span>
          </div>
          <div className="relative h-24 w-full">
            <svg viewBox="0 0 500 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={moodChartSvg.areaD} fill="url(#chartGradient)" />
              <path d={moodChartSvg.pathD} fill="none" stroke="rgb(59, 130, 246)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {moodChartSvg.points.map((p, i) => chartData[i].hasData && (
                <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="rgb(59, 130, 246)" className="animate-pulse" />
              ))}
            </svg>
          </div>
          <div className="flex justify-between mt-2 px-1 text-[8px] text-muted font-mono">
            <span>30D AGO</span>
            <span>PRESENT</span>
          </div>
        </div>
      </div>

      {/* Affirmation Carousel */}
      <div className="glass-card soft-glow-purple p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl transition-all">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-amber-400 to-purple-500 opacity-80"></div>
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h3 className="label brand">Daily Invocations</h3>
            <p className="text-[10px] text-muted italic">Core Frequency Alignment</p>
          </div>
          <button 
            onClick={handleRefreshAffirmations} 
            disabled={loading}
            className="label text-secondary hover:text-purple-500 dark:hover:text-white transition-colors"
          >
            {loading ? 'Aligning...' : 'Refresh'}
          </button>
        </div>
        <div className="mb-4">
          <button
            aria-label="Add New Affirmation"
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-black text-[12px] font-bold"
            onClick={() => window.dispatchEvent(new CustomEvent('openAddAffirmation'))}
          >
            Add New Affirmation
          </button>
        </div>
        <div className="relative min-h-[140px] flex flex-col justify-center items-center text-center">
          {state.dailyAffirmation ? (
            <>
              <div className="w-full transition-all duration-500 transform animate-in fade-in zoom-in-95" key={affirmationIndex}>
                <p className="text-2xl font-serif text-primary italic leading-relaxed px-4">
                  "{state.dailyAffirmation[affirmationIndex]}"
                </p>
                <div className="mt-8 flex justify-center gap-2">
                  {state.dailyAffirmation.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setAffirmationIndex(i)}
                      className={`h-1 rounded-full transition-all duration-300 ${i === affirmationIndex ? 'w-6 bg-purple-500' : 'w-2 bg-white/60 dark:bg-white/10'}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="absolute inset-y-0 left-0 flex items-center">
                <button 
                  onClick={() => setAffirmationIndex(prev => (prev > 0 ? prev - 1 : state.dailyAffirmation!.length - 1))}
                  className="p-2 text-secondary hover:text-purple-500 transition-colors"
                >
                  <span className="text-[10px] label">Prev</span>
                </button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button 
                  onClick={() => setAffirmationIndex(prev => (prev < state.dailyAffirmation!.length - 1 ? prev + 1 : 0))}
                  className="p-2 text-secondary hover:text-purple-500 transition-colors"
                >
                  <span className="text-[10px] label">Next</span>
                </button>
              </div>
            </>
          ) : (
            <div className="animate-pulse flex flex-col items-center space-y-4">
               <div className="h-6 bg-white/60 dark:bg-white/10 rounded-full w-64"></div>
               <div className="h-4 bg-white/40 dark:bg-white/5 rounded-full w-48"></div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-8 rounded-[2rem] shadow-lg border-white/5 dark:border-white/5">
        <h3 className="label accent mb-8 text-center">Frequency Input</h3>
        <div className="flex justify-around items-center gap-2">
          {(['Radiant', 'Balanced', 'Quiet', 'Challenged', 'Heavy'] as Mood[]).map((m) => (
            <button
              key={m}
              onClick={() => handleMoodSelect(m)}
              className={`flex flex-col items-center space-y-3 transition-all transform hover:scale-110 ${currentMood === m ? 'scale-115' : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100'}`}
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] flex items-center justify-center text-2xl transition-all shadow-xl ${currentMood === m ? 'ring-2 ring-amber-500 bg-amber-500/10 dark:bg-amber-400/10' : 'bg-white/60 dark:bg-white/10'}`}>
                <span className="label text-secondary">{m[0]}</span>
              </div>
              <span className="label text-secondary">{m}</span>
            </button>
          ))}
        </div>
      </div>
      
      <MyAffirmations />
    </div>
  );
};

export default Dashboard;
