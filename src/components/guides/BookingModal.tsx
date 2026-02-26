
import React, { useState } from 'react';
import { Guide, createAppointment } from '../../services/guideService';

interface BookingModalProps {
  guide: Guide;
  isOpen: boolean;
  onClose: () => void;
  userId: string; // In a real app, this would come from AuthContext
}

const BookingModal: React.FC<BookingModalProps> = ({ guide, isOpen, onClose, userId }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  if (userId === 'guest') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-md glass-card rounded-3xl shadow-2xl overflow-hidden border border-card-border transform transition-all scale-100 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-accent-subtle rounded-full flex items-center justify-center mx-auto text-3xl">
            🔒
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-primary">Authentication Required</h3>
            <p className="text-secondary mt-2">
              Please sign in to book a session with {guide.name}.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl btn-primary-ritual text-btn-primary font-bold hover:shadow-accent-primary/20 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setStatus('submitting');
    try {
      await createAppointment({
        userId,
        guideId: guide.id,
        guideName: guide.name,
        date: selectedDate,
        time: selectedTime,
        status: 'pending'
      });
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setSelectedDate('');
        setSelectedTime('');
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to book session');
    }
  };

  // Filter available time slots based on the selected date (mock logic)
  // In a real app, you'd check availability against existing appointments
  const availableSlots = guide.availability.timeSlots;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden border border-card-border transform transition-all scale-100">
        
        {/* Header */}
        <div className="p-6 border-b border-card-border flex justify-between items-center bg-secondary/50">
          <div>
            <h3 className="text-xl font-serif font-bold text-primary">Book Session</h3>
            <p className="text-sm text-muted">with {guide.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted hover:text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {status === 'success' ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-accent-subtle rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                ✅
              </div>
              <h4 className="text-lg font-bold text-accent-primary">Booking Confirmed!</h4>
              <p className="text-sm text-secondary">
                You will receive a confirmation email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted">
                  Select Date
                </label>
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-card-border text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow"
                />
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted">
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`px-2 py-2 rounded-lg text-sm font-medium border transition-all ${
                        selectedTime === slot 
                          ? 'bg-accent-primary text-btn-primary border-accent-primary shadow-lg shadow-accent-primary/20' 
                          : 'bg-card-bg text-secondary border-card-border hover:border-accent-primary/50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-card-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Session Price</span>
                  <span className="font-bold text-primary">${guide.pricePerSession}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Duration</span>
                  <span className="font-bold text-primary">{guide.sessionDuration} min</span>
                </div>
              </div>

              {/* Error Message */}
              {status === 'error' && (
                <div className="p-3 rounded-lg bg-error text-error text-sm text-center">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={status === 'submitting' || !selectedDate || !selectedTime}
                className="w-full py-3 rounded-xl btn-primary-ritual font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {status === 'submitting' ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
