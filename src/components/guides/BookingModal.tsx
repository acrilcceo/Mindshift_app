
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="w-full max-w-md bg-white dark:bg-[#1a1a1c] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 transform transition-all scale-100 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto text-3xl">
            🔒
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Authentication Required</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Please sign in to book a session with {guide.name}.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-black font-bold hover:shadow-lg transition-all"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a1c] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 transform transition-all scale-100">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Book Session</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">with {guide.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {status === 'success' ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                ✅
              </div>
              <h4 className="text-lg font-bold text-green-600 dark:text-green-400">Booking Confirmed!</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                You will receive a confirmation email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Date
                </label>
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-shadow"
                />
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                          ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' 
                          : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-amber-500/50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Session Price</span>
                  <span className="font-bold text-slate-900 dark:text-white">${guide.pricePerSession}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Duration</span>
                  <span className="font-bold text-slate-900 dark:text-white">{guide.sessionDuration} min</span>
                </div>
              </div>

              {/* Error Message */}
              {status === 'error' && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs text-center">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={status === 'submitting' || !selectedDate || !selectedTime}
                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-black font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/10"
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
