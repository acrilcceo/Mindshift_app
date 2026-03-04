import React, { useState } from 'react';
import { useCircles } from '../../context/CircleContext';

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCircleModal: React.FC<CreateCircleModalProps> = ({ isOpen, onClose }) => {
  const { createCircle } = useCircles();
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      await createCircle(name);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-surface-elevated dark:bg-darkSurface-elevated border border-card-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-textPrimary-light dark:text-textPrimary-dark">New Momentum Circle</h2>
            <button onClick={onClose} className="text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-textSecondary-light dark:text-textSecondary-dark mb-2">Circle Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Morning Calm, Night Owls..."
                className="w-full bg-surface-muted dark:bg-darkSurface-muted border border-card-border rounded-xl px-4 py-3 text-textPrimary-light dark:text-textPrimary-dark placeholder-textSecondary-light dark:placeholder-textSecondary-dark focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isCreating}
                className="px-6 py-2 rounded-xl bg-btn-primary text-btn-primary font-medium shadow-btn hover:shadow-btn-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
              >
                {isCreating ? 'Creating...' : 'Start Circle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
