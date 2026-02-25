
import React, { useState, useEffect } from 'react';
import { Guide, getGuideReviews } from '../../services/guideService';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import BookingModal from './BookingModal';

interface GuideProfileProps {
  guide: Guide;
  onBack: () => void;
  userId?: string; // Optional user ID for booking
}

const GuideProfile: React.FC<GuideProfileProps> = ({ guide, onBack, userId }) => {
  const [reviews, setReviews] = useState([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const data = await getGuideReviews(guide.id);
        setReviews(data);
      } catch (error) {
        console.error('Failed to load reviews:', error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [guide.id]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-amber-500 transition-colors"
      >
        ← Back to Guides
      </button>

      {/* Hero Section */}
      <div className="glass-card p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl shadow-amber-900/10">
              <img 
                src={guide.profileImage} 
                alt={guide.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="mt-6 space-y-3">
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="w-full py-4 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-black font-bold text-lg hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all"
              >
                Book Session
              </button>
              <button 
                onClick={() => window.location.href = `mailto:${guide.email}`}
                className="w-full py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
              >
                Email Guide
              </button>
            </div>
          </div>

          <div className="w-full md:w-2/3 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-amber-50">
                  {guide.name}
                </h1>
                {guide.verified && (
                  <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-lg text-amber-600 dark:text-amber-400 font-medium">
                {guide.title}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {guide.specialty.map((spec) => (
                <span 
                  key={spec}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                >
                  {spec}
                </span>
              ))}
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                {guide.bio}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
              <div>
                <span className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Session Price</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">${guide.pricePerSession}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Duration</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{guide.sessionDuration} min</span>
              </div>
            </div>
            
            <div className="pt-4">
               <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Availability</h3>
               <div className="flex flex-wrap gap-2">
                 {guide.availability.days.map(day => (
                   <span key={day} className="px-3 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-900/30">
                     {day}
                   </span>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
            Client Reviews 
            <span className="ml-3 text-lg font-normal text-slate-400">({guide.totalReviews})</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-xl">⭐</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{guide.rating.toFixed(1)}</span>
          </div>
        </div>
        
        {isLoadingReviews ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <ReviewForm 
              guideId={guide.id}
              userId={userId || 'guest'}
              userName={userId || 'Guest'}
              onReviewAdded={() => {
                // Re-fetch reviews
                getGuideReviews(guide.id).then(setReviews);
              }}
            />
            <ReviewList reviews={reviews} />
          </div>
        )}
      </div>

      <BookingModal 
        guide={guide}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        userId={userId || 'guest'}
      />
    </div>
  );
};

export default GuideProfile;
