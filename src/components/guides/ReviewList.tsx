
import React from 'react';
import { GuideReview } from '../../types/guide';

interface ReviewListProps {
  reviews: GuideReview[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted italic">
        No reviews yet. Be the first to share your experience!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="glass-card p-6 rounded-2xl border border-card-border bg-card">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-secondary/10 flex items-center justify-center text-accent-secondary font-bold text-lg">
                {review.userName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-primary">{review.userName}</h4>
                <div className="flex text-accent-secondary text-sm">
                  {'⭐'.repeat(Math.round(review.rating))}
                </div>
              </div>
            </div>
            <span className="text-sm text-muted">
              {new Date(review.date).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-3 text-sm text-secondary leading-relaxed">
            "{review.review}"
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
