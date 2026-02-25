
import React from 'react';
import { Guide } from '../../types/guide';

interface GuideCardProps {
  guide: Guide;
  onViewProfile: (guide: Guide) => void;
  onBookSession: (guide: Guide) => void;
}

const GuideCard: React.FC<GuideCardProps> = ({ guide, onViewProfile, onBookSession }) => {
  return (
    <article 
      className="group glass-card overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-black/20"
      onClick={() => onViewProfile(guide)}
    >
      <div className="relative p-6 flex flex-col items-center text-center space-y-4">
        {/* Profile Image with Glow Effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <img 
            src={guide.profileImage} 
            alt={guide.name}
            className="relative w-24 h-24 rounded-full object-cover border-2 border-white dark:border-white/10 shadow-md group-hover:scale-105 transition-transform duration-300"
          />
          {guide.verified && (
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] border-2 border-white dark:border-[#0a0a0c]" title="Verified Guide">
              ✓
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="text-lg font-serif font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {guide.name}
          </h3>
          <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
            {guide.title}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm text-amber-500">
          <span>⭐</span>
          <span className="font-semibold">{guide.rating.toFixed(1)}</span>
          <span className="text-slate-400 dark:text-slate-600 text-xs">({guide.totalReviews} reviews)</span>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap justify-center gap-2">
          {guide.specialty.slice(0, 3).map((spec, index) => (
            <span 
              key={index} 
              className="px-2 py-1 rounded-full text-[10px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5"
            >
              {spec}
            </span>
          ))}
          {guide.specialty.length > 3 && (
            <span className="px-2 py-1 rounded-full text-[10px] text-slate-400 dark:text-slate-500">
              +{guide.specialty.length - 3}
            </span>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="w-full pt-4 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="text-left">
            <p className="text-xs text-slate-400 dark:text-slate-500">Session</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              ${guide.pricePerSession} <span className="text-[10px] font-normal text-slate-400">/ {guide.sessionDuration}m</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `mailto:${guide.email}`;
              }}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              title="Email Guide"
            >
              ✉️
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBookSession(guide);
              }}
              className="px-4 py-1.5 rounded-full bg-slate-900 dark:bg-amber-500 text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/10"
            >
              Book
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default GuideCard;
