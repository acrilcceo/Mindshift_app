
import React from 'react';
import { GuideReview } from '../../types/guide';

interface ReviewListProps {
  reviews: GuideReview[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400 italic">
        No reviews yet. Be the first to share your experience!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="glass-card p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-white/40 dark:bg-black/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-lg">
                {review.userName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">{review.userName}</h4>
                <div className="flex text-amber-400 text-xs">
                  {'⭐'.repeat(Math.round(review.rating))}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            "{review.review}"
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
