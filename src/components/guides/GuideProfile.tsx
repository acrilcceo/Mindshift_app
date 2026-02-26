
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
        className="flex items-center gap-2 text-sm text-muted hover:text-accent-secondary transition-colors"
      >
        ← Back to Guides
      </button>

      {/* Hero Section */}
      <div className="glass-card p-8 rounded-[2.5rem] border border-card-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl shadow-accent-secondary/10">
              <img 
                src={guide.profileImage} 
                alt={guide.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="mt-6 space-y-3">
              <button 
                onClick={() => setIsBookingOpen(true)}
                className="btn-primary-ritual w-full py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-accent-secondary/20 hover:-translate-y-0.5 transition-all"
              >
                Book Session
              </button>
              <button 
                onClick={() => window.location.href = `mailto:${guide.email}`}
                className="w-full py-3 rounded-xl bg-card border border-card-border text-primary font-medium hover:bg-secondary transition-colors"
              >
                Email Guide
              </button>
            </div>
          </div>

          <div className="w-full md:w-2/3 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary">
                  {guide.name}
                </h1>
                {guide.verified && (
                  <span className="bg-accent-primary text-btn-primary text-sm px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-lg text-accent-secondary font-medium">
                {guide.title}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {guide.specialty.map((spec) => (
                <span 
                  key={spec}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary border border-card-border"
                >
                  {spec}
                </span>
              ))}
            </div>

            <div className="prose max-w-none">
              <p className="text-secondary leading-relaxed text-lg">
                {guide.bio}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-card-border">
              <div>
                <span className="block text-sm uppercase tracking-wider text-muted mb-1">Session Price</span>
                <span className="text-2xl font-bold text-primary">${guide.pricePerSession}</span>
              </div>
              <div>
                <span className="block text-sm uppercase tracking-wider text-muted mb-1">Duration</span>
                <span className="text-2xl font-bold text-primary">{guide.sessionDuration} min</span>
              </div>
            </div>
            
            <div className="pt-4">
               <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Availability</h3>
               <div className="flex flex-wrap gap-2">
                 {guide.availability.days.map(day => (
                   <span key={day} className="px-3 py-1 rounded-lg bg-accent-subtle text-accent-primary text-sm font-bold border border-accent-border-subtle">
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
          <h3 className="text-2xl font-serif font-bold text-primary">
            Client Reviews 
            <span className="ml-3 text-lg font-normal text-muted">({guide.totalReviews})</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-accent text-xl">⭐</span>
            <span className="text-xl font-bold text-primary">{guide.rating.toFixed(1)}</span>
          </div>
        </div>
        
        {isLoadingReviews ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
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
