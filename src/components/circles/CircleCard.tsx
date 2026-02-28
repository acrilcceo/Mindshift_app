import React from 'react';
import { Circle } from '../../context/CircleContext';
import { getAuraStyles } from '../../utils/auraStyles';

interface CircleCardProps {
  circle: Circle;
  onClick?: () => void;
}

export const CircleCard: React.FC<CircleCardProps> = ({ circle, onClick }) => {
  const auraStyles = getAuraStyles(circle.groupAura);

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#151922] p-5 transition-all duration-300 hover:shadow-md cursor-pointer group ${auraStyles.container}`}
    >
      {/* Background Aura Hint */}
      <div className={`absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-20 ${auraStyles.background}`} />
      
      <div className="relative flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-accent-primary transition-colors">
            {circle.name}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {circle.memberCount} members • Avg Aura {circle.groupAura}
          </p>
        </div>
        
        {/* Status Indicator */}
        <div className="flex flex-col items-end gap-2">
          {circle.activeSessionId ? (
            <span className="px-2 py-1 rounded-full bg-indigo-100 dark:bg-accent-primary/20 text-indigo-700 dark:text-accent-primary text-xs font-medium animate-pulse">
              Session Active
            </span>
          ) : (
            <div className={`h-2 w-2 rounded-full ${circle.groupAura > 10 ? 'bg-indigo-500 dark:bg-accent-glow' : 'bg-slate-300 dark:bg-gray-600'}`} />
          )}
        </div>
      </div>
      
      {/* Microcopy */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
        <span>Shared presence builds momentum.</span>
      </div>
    </div>
  );
};
