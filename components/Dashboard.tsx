
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { generateAffirmations } from '../services/affirmationEngine';
import { affirmationPool } from '../services/affirmationLibrary';
import { Mood, AppState } from '../src/types';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselPool, setCarouselPool] = useState<string[]>(affirmationPool);
  const moodTabsRef = useRef<HTMLDivElement | null>(null);
  const [showMoodLeftFade, setShowMoodLeftFade] = useState(false);
  const [showMoodRightFade, setShowMoodRightFade] = useState(false);

  useEffect(() => {
    if (!state.dailyAffirmation) {
      handleRefreshAffirmations();
    }
  }, []);

  useEffect(() => {
    const el = moodTabsRef.current;
    if (!el) return;
    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowMoodLeftFade(scrollLeft > 0);
      setShowMoodRightFade(scrollLeft + clientWidth < scrollWidth - 1);
    };
    update();
    el.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const handleRefreshAffirmations = async () => {
    setLoading(true);
    try {
      const mood = state.moodHistory.find(h => h.date === new Date().toDateString())?.mood || 'Balanced';
      const recentGratitude = state.gratitudeList.slice(0, 3).join('. ');
      const recentBeliefs = state.beliefs.slice(0, 3).map(b => b.reframed).join('. ');
      const recentActions = state.ftbaEntries.slice(0, 3).map(e => e.action).join('. ');
      const recentWhispers = state.whisperGoals.slice(0, 3).map(w => w.text).join('. ');
      
      const context = [
        recentGratitude ? `Focuses of Gratitude: ${recentGratitude}` : '',
        recentBeliefs ? `Reframed Empowering Beliefs: ${recentBeliefs}` : '',
        recentActions ? `Intended Neural Actions: ${recentActions}` : '',
        recentWhispers ? `Whisper Goals: ${recentWhispers}` : ''
      ].filter(Boolean).join('; ');

      const result = await generateAffirmations(mood, context);
      const candidate = result[0];
      const existing = state.dailyAffirmation || [];
      if (!candidate) {
        if (!existing.length) {
          onUpdate({ dailyAffirmation: [] });
        }
        return;
      }
      let next = existing;
      if (!existing.includes(candidate)) {
        next = [...existing, candidate];
        if (next.length > 3) {
          next = next.slice(-3);
        }
      }
      onUpdate({ dailyAffirmation: next });
      setCarouselPool(prev => (prev.includes(candidate) ? prev : [...prev, candidate]));
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
  const totalSlides = carouselPool.length;

  const handleNext = () => {
    if (!totalSlides) return;
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    if (!totalSlides) return;
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  };

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
          <h2 className="text-4xl font-serif text-primary font-bold">Today's Focus</h2>
          <p className="text-secondary body-sm mt-1">Aligning your frequency for peak potential.</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-accent-primary drop-shadow-sm">{state.streak}</div>
          <div className="label text-secondary mt-1">Day Streak</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass-card p-8 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 border-accent-secondary/10 shadow-xl dark:shadow-none">
          <div className="text-center sm:text-left">
            <h3 className="label brand">Vibration Index</h3>
            <p className="body-sm text-muted mt-1">Holistic consistency score</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-4xl font-bold text-primary">{calculateVibrationScore()}%</div>
            <div className="w-24 h-2 bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-accent-secondary transition-all duration-1000 shadow-[0_0_10px_var(--accent-glow)]" style={{ width: `${calculateVibrationScore()}%` }}></div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border border-card-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="label brand flex items-center gap-2">
              <span>SoundShift Studio</span>
            </h3>
            <p className="text-sm text-muted mt-1">
              Regulate your state through sound. Last session and listening time appear here.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <div className="text-sm text-secondary">Audio contribution coming soon</div>
          </div>
        </div>

        {/* Mood History Chart */}
        <div className="glass-card p-6 rounded-[2rem] border border-card-border">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="label text-secondary">30-Day Frequency Trend</h3>
            <span className="label brand">Emotional Arc</span>
          </div>
          <div className="relative h-24 w-full text-accent-primary">
            <svg viewBox="0 0 500 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={moodChartSvg.areaD} fill="url(#chartGradient)" />
              <path d={moodChartSvg.pathD} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {moodChartSvg.points.map((p, i) => chartData[i].hasData && (
                <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="currentColor" className="animate-pulse" />
              ))}
            </svg>
          </div>
          <div className="flex justify-between mt-2 px-1 text-sm text-muted font-mono">
            <span>30D AGO</span>
            <span>PRESENT</span>
          </div>
        </div>
      </div>

      {/* Affirmation Carousel */}
      <div className="glass-card soft-glow-purple rounded-[2.5rem] relative overflow-hidden shadow-2xl transition-all invocation-card">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary opacity-80"></div>
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h3 className="label brand">Daily Invocations</h3>
            <p className="text-sm text-muted italic">Core Frequency Alignment</p>
          </div>
          <button 
            onClick={handleRefreshAffirmations} 
            disabled={loading}
            className="label text-secondary hover:text-accent-primary transition-colors"
          >
            {loading ? 'Aligning...' : 'Refresh'}
          </button>
        </div>
        <div className="mb-2">
          <button
            aria-label="Add New Affirmation"
            className="px-4 py-2 rounded-xl bg-card border border-card-border text-primary text-sm font-bold shadow-md shadow-accent-secondary/10 hover:shadow-lg hover:shadow-accent-secondary/25 transition-all active:scale-95"
            onClick={() => window.dispatchEvent(new CustomEvent('openAddAffirmation'))}
          >
            Add New Affirmation
          </button>
        </div>
        <div className="affirmation-body text-center">
          {carouselPool.length > 0 ? (
            <>
              <div className="carousel-wrapper">
                <div
                  className="carousel-track"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {carouselPool.map((text, index) => (
                    <div
                      key={index}
                      className="carousel-slide"
                    >
                      <div className="w-full transition-all duration-500 transform animate-in fade-in zoom-in-95 affirmation-text-block">
                        <p className="affirmation-text font-serif text-primary italic">
                          "{text}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="affirmation-controls">
                <button 
                  onClick={handlePrev}
                  className="p-2 text-secondary hover:text-accent-primary transition-colors"
                >
                  <span className="text-sm label">Prev</span>
                </button>
                <button 
                  onClick={handleNext}
                  className="p-2 text-secondary hover:text-accent-primary transition-colors"
                >
                  <span className="text-sm label">Next</span>
                </button>
              </div>
            </>
          ) : (
            <div className="animate-pulse flex flex-col items-center space-y-4">
               <div className="h-6 bg-secondary/60 rounded-full w-64"></div>
               <div className="h-4 bg-secondary/40 rounded-full w-48"></div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-8 rounded-[2rem] shadow-lg border border-card-border frequency-card">
        <h3 className="label accent mb-8 text-center">Frequency Input</h3>
        <div className="frequency-tabs-viewport">
          <div ref={moodTabsRef} className="frequency-tabs-wrapper frequency-container">
            {(['Radiant', 'Balanced', 'Quiet', 'Challenged', 'Heavy'] as Mood[]).map((m) => (
              <div
                key={m}
                className={`frequency-item transition-all transform hover:scale-110 ${
                  currentMood === m
                    ? 'scale-115'
                    : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleMoodSelect(m)}
                  className={`frequency-circle shadow-xl ${
                  currentMood === m
                    ? 'ring-2 ring-accent-primary bg-accent-subtle'
                    : 'bg-card text-muted hover:text-primary hover:bg-accent-subtle/50'
                }`}
                  aria-label={m}
                >
                  <span className="label text-secondary text-2xl">{m[0]}</span>
                </button>
                <span className="frequency-label label text-secondary">
                  {m}
                </span>
              </div>
            ))}
          </div>
          {showMoodLeftFade && <div className="frequency-tabs-fade frequency-tabs-fade-left" />}
          {showMoodRightFade && <div className="frequency-tabs-fade frequency-tabs-fade-right" />}
        </div>
      </div>
      
      <MyAffirmations />
    </div>
  );
};

export default Dashboard;
