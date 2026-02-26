
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
      className="group glass-card overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-[2rem] border border-card-border bg-card"
      onClick={() => onViewProfile(guide)}
    >
      <div className="relative p-6 flex flex-col items-center text-center space-y-4">
        {/* Profile Image with Glow Effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-accent-secondary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <img 
            src={guide.profileImage} 
            alt={guide.name}
            className="relative w-24 h-24 rounded-full object-cover border-2 border-card-border shadow-md group-hover:scale-105 transition-transform duration-300"
          />
          {guide.verified && (
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center text-btn-primary text-sm border-2 border-card" title="Verified Guide">
              ✓
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="text-lg font-serif font-bold text-primary group-hover:text-accent-secondary transition-colors">
            {guide.name}
          </h3>
          <p className="text-sm uppercase tracking-wider text-muted font-medium">
            {guide.title}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm text-accent-secondary">
          <span>⭐</span>
          <span className="font-semibold">{guide.rating.toFixed(1)}</span>
          <span className="text-muted text-sm">({guide.totalReviews} reviews)</span>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap justify-center gap-2">
          {guide.specialty.slice(0, 3).map((spec, index) => (
            <span 
              key={index} 
              className="px-2 py-1 rounded-full text-sm bg-secondary text-secondary border border-card-border"
            >
              {spec}
            </span>
          ))}
          {guide.specialty.length > 3 && (
            <span className="px-2 py-1 rounded-full text-sm text-muted">
              +{guide.specialty.length - 3}
            </span>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="w-full pt-4 mt-2 border-t border-card-border flex items-center justify-between">
          <div className="text-left">
            <p className="text-sm text-muted">Session</p>
            <p className="text-sm font-bold text-primary">
              ${guide.pricePerSession} <span className="text-sm font-normal text-muted">/ {guide.sessionDuration}m</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `mailto:${guide.email}`;
              }}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary hover:bg-secondary/80 transition-colors"
              title="Email Guide"
            >
              ✉️
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBookSession(guide);
              }}
              className="btn-primary-ritual px-4 py-1.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-accent-secondary/10"
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
