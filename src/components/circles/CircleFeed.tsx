import React, { useState } from 'react';
import { useCircles, Circle } from '../../context/CircleContext';
import { CircleCard } from './CircleCard';
import { CreateCircleModal } from './CreateCircleModal';
import { CircleDetail } from './CircleDetail';

export const CircleFeed: React.FC = () => {
  const { myCircles, loading } = useCircles();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-serif text-textPrimary-light dark:text-textPrimary-dark flex items-center gap-2">
          <span className="text-accent-secondary dark:text-accent-secondary">🔥</span> Momentum Circles
        </h2>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="text-sm text-accent-secondary dark:text-accent-secondary hover:text-accent-primary dark:hover:text-accent-primary transition-colors font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-accent-secondary/10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Circle
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-surface-muted dark:bg-darkSurface-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : myCircles.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {myCircles.map(circle => (
            <CircleCard 
              key={circle.id} 
              circle={circle} 
              onClick={() => setSelectedCircle(circle)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface-elevated dark:bg-darkSurface-elevated rounded-2xl border border-card-border border-dashed group hover:border-textSecondary-light/30 transition-colors">
          <div className="w-12 h-12 rounded-full bg-surface-muted dark:bg-darkSurface-muted flex items-center justify-center mx-auto mb-3 text-textSecondary-light dark:text-textSecondary-dark group-hover:text-textPrimary-light dark:group-hover:text-textPrimary-dark transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-textPrimary-light dark:text-textPrimary-dark font-semibold">No circles yet.</p>
          <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark mt-1 max-w-[200px] mx-auto leading-relaxed">
            Create a private circle to share silent momentum with close friends.
          </p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 px-4 py-2 bg-btn-primary text-btn-primary text-sm font-medium rounded-xl shadow-btn hover:shadow-btn-hover transition-all transform hover:-translate-y-0.5"
          >
            Start a Circle
          </button>
        </div>
      )}

      <CreateCircleModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      
      {selectedCircle && (
        <CircleDetail 
          circle={selectedCircle} 
          onClose={() => setSelectedCircle(null)} 
        />
      )}
    </div>
  );
};
