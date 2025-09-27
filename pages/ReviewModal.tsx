import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Swap } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { StarIcon } from '../components/icons';

interface ReviewModalProps {
  swap: Swap;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ swap, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    setError('');
    setLoading(true);
    await onSubmit(rating, comment);
    setLoading(false);
  };

  if (!user) return null;

  const reviewee = user.id === swap.teacher.id ? swap.learner : swap.teacher;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-full" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Leave a Review</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">How was your experience with <span className="font-semibold">{reviewee.fullName}</span> for the skill <span className="font-semibold">{swap.skill.title}</span>?</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Your Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-yellow-400 rounded-full"
                  aria-label={`Rate ${star} stars`}
                >
                  <StarIcon className={`h-10 w-10 transition-all duration-150 ${ (hoverRating || rating) >= star ? 'text-yellow-400 scale-110' : 'text-slate-300 dark:text-slate-600'}`} />
                </button>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Comment (optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="mt-1 form-input"
              placeholder="Describe your experience..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary w-36 flex justify-center">
              {loading ? <LoadingSpinner size="sm" /> : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
       <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
    `}</style>
    </div>
  );
};

export default ReviewModal;