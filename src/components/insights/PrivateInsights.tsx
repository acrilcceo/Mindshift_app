import React, { useMemo } from 'react';
import { useMind } from '../../context/MindContext';

export const PrivateInsights: React.FC = () => {
  const { state } = useMind();
  const { ftbaEntries, manifestationStreak } = state;

  // 1. Calculate 7-Day Consistency
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Check if entry exists for this date
      const hasEntry = ftbaEntries.some(e => e.timestamp.startsWith(dateStr));
      const hasManifestation = manifestationStreak?.lastDate === dateStr; 
      // Note: This only checks if manifestation was done *today* if it matches lastDate. 
      // Ideally we'd have a full history log of manifestations.
      
      days.push({ 
        date: dateStr, 
        label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        active: hasEntry || (hasManifestation && i === 0) // Only count manifestation for today if logic is limited
      });
    }
    return days;
  }, [ftbaEntries, manifestationStreak]);

  // 2. Monthly Aura Graph (Last 14 entries)
  const auraHistory = useMemo(() => {
    const moodMap: Record<string, number> = {
      'Radiant': 5, 'Balanced': 4, 'Quiet': 3, 'Challenged': 2, 'Heavy': 1
    };
    
    // Sort by timestamp just in case
    const sorted = [...ftbaEntries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    return sorted.slice(-14).map(e => ({
      date: e.timestamp.split('T')[0].slice(5), // MM-DD
      level: moodMap[e.feel] || 3,
      mood: e.feel
    }));
  }, [ftbaEntries]);

  const getMoodColorClass = (mood: string) => {
    switch (mood) {
      case 'Radiant': return 'bg-amber-400';
      case 'Balanced': return 'bg-emerald-400';
      case 'Quiet': return 'bg-indigo-400';
      case 'Challenged': return 'bg-red-400';
      case 'Heavy': return 'bg-slate-400';
      default: return 'bg-purple-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-serif text-textPrimary-light dark:text-textPrimary-dark flex items-center gap-2">
          <span className="text-accent-primary">⚡</span> Private Insights
        </h2>
        <span className="text-[10px] text-textSecondary-light dark:text-textSecondary-dark px-2 py-1 rounded-full bg-surface-muted dark:bg-darkSurface-muted border border-card-border">
          Visible only to you
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Consistency Grid */}
        <div className="p-5 rounded-2xl bg-surface-elevated dark:bg-darkSurface-elevated border border-card-border shadow-sm relative overflow-hidden group hover:border-accent-secondary/30 transition-colors">
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent-secondary/5 blur-[40px] rounded-full pointer-events-none" />
          
          <h3 className="text-sm font-medium text-textSecondary-light dark:text-textSecondary-dark mb-4 flex items-center justify-between">
            7-Day Rhythm
            <span className="text-xs text-textSecondary-light dark:text-textSecondary-dark opacity-50"> consistency</span>
          </h3>
          
          <div className="flex justify-between items-end h-12 px-2">
            {last7Days.map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-3 relative">
                <div 
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                    day.active 
                      ? 'bg-accent-secondary shadow-[0_0_8px_var(--accent-glow)] scale-110' 
                      : 'bg-surface-muted dark:bg-darkSurface-muted'
                  }`}
                />
                <span className="text-[10px] text-textSecondary-light dark:text-textSecondary-dark opacity-50 font-mono">
                  {day.label}
                </span>
                
                {/* Connecting Line (visual only) */}
                {/* Could add SVG line here if needed for "flow" */}
              </div>
            ))}
          </div>
        </div>

        {/* 2. Aura Flow Graph */}
        <div className="p-5 rounded-2xl bg-surface-elevated dark:bg-darkSurface-elevated border border-card-border shadow-sm relative overflow-hidden group hover:border-card-border/80 transition-colors">
           <div className="absolute top-0 left-0 w-20 h-20 bg-accent-primary/5 blur-[40px] rounded-full pointer-events-none" />
           
          <h3 className="text-sm font-medium text-textSecondary-light dark:text-textSecondary-dark mb-4 flex items-center justify-between">
            Energy Flow
            <span className="text-xs text-textSecondary-light dark:text-textSecondary-dark opacity-50"> last 14 entries</span>
          </h3>
          
          <div className="h-24 w-full flex items-end justify-between gap-1 px-1">
            {auraHistory.length > 0 ? (
              auraHistory.map((entry, i) => {
                const height = Math.max(15, (entry.level / 5) * 100); // Min height 15%
                const colorClass = getMoodColorClass(entry.mood);
                
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end group/bar relative">
                    <div 
                      style={{ height: `${height}%` }} 
                      className={`w-full rounded-t-sm opacity-40 group-hover/bar:opacity-100 transition-all duration-300 ${colorClass}`}
                    />
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-textSecondary-light dark:text-textSecondary-dark opacity-50 text-xs italic">
                Log your mood to see flow
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Summary / Reflection */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-accent-secondary/5 to-accent-primary/5 border border-card-border relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-[0.03]" />
        
        <h3 className="text-sm font-medium text-accent-secondary mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Weekly Pattern
        </h3>
        <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark leading-relaxed relative z-10">
          Your energy has been <span className="text-textPrimary-light dark:text-textPrimary-dark font-medium">consistent</span> this week. 
          Focus on maintaining your morning rituals to keep the momentum flowing.
          {/* Placeholder logic */}
        </p>
      </div>

    </div>
  );
};
