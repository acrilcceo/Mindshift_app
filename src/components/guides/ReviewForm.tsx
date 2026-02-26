import React, { useState } from 'react';
import { addReview } from '../../services/guideService';

interface ReviewFormProps {
  guideId: string;
  userId: string;
  userName: string;
  onReviewAdded: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ guideId, userId, userName, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (userId === 'guest') {
    return (
      <div className="p-6 rounded-2xl bg-secondary border border-card-border text-center">
        <p className="text-muted">
          Please <span className="font-bold text-primary">sign in</span> to leave a review.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!reviewText.trim()) {
      setError('Please write a review');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addReview({
        guideId,
        userId,
        userName,
        rating,
        review: reviewText,
      });
      
      setRating(0);
      setReviewText('');
      onReviewAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-card-border bg-card">
      <h4 className="text-lg font-bold text-primary mb-4">Write a Review</h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted">
        Rating
      </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="text-2xl transition-transform hover:scale-110 focus:outline-none"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <span className={star <= (hoverRating || rating) ? 'text-accent-secondary' : 'text-muted/30'}>
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted">
            Review
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-card border border-card-border text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow resize-none placeholder:text-muted"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary-ritual px-6 py-2 rounded-xl"
        >
          {isSubmitting ? 'Submitting...' : 'Post Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
