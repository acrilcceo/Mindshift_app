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
      className={`relative overflow-hidden rounded-2xl border border-card-border bg-surface-elevated dark:bg-darkSurface-elevated p-5 transition-all duration-300 hover:shadow-md cursor-pointer group ${auraStyles.container}`}
    >
      {/* Background Aura Hint */}
      <div className={`absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-20 ${auraStyles.background}`} />
      
      <div className="relative flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-textPrimary-light dark:text-textPrimary-dark mb-1 group-hover:text-accent-secondary dark:group-hover:text-accent-primary transition-colors">
            {circle.name}
          </h3>
          <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
            {circle.memberCount} members • Avg Aura {circle.groupAura}
          </p>
        </div>
        
        {/* Status Indicator */}
        <div className="flex flex-col items-end gap-2">
          {circle.activeSessionId ? (
            <span className="px-2 py-1 rounded-full bg-accent-secondary/10 dark:bg-accent-primary/20 text-accent-secondary dark:text-accent-primary text-xs font-medium animate-pulse">
              Session Active
            </span>
          ) : (
            <div className={`h-2 w-2 rounded-full ${circle.groupAura > 10 ? 'bg-accent-secondary dark:bg-accent-glow' : 'bg-surface-muted dark:bg-surface-muted'}`} />
          )}
        </div>
      </div>
      
      {/* Microcopy */}
      <div className="mt-4 pt-4 border-t border-card-border flex items-center justify-between text-xs text-textSecondary-light dark:text-textSecondary-dark">
        <span>Shared presence builds momentum.</span>
      </div>
    </div>
  );
};
