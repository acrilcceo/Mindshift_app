import React, { useEffect, useState } from 'react';
import { CircleSession } from '../../context/CircleContext';
import AudioEngine from '../../services/AudioEngine';

interface SilentSessionOverlayProps {
  session: CircleSession | null;
  onClose: () => void;
  onComplete: () => void;
}

export const SilentSessionOverlay: React.FC<SilentSessionOverlayProps> = ({ session, onClose, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Initialize and Sync Timer
  useEffect(() => {
    if (!session || !session.startTime) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = session.startTime instanceof Date 
        ? session.startTime.getTime() 
        : (session.startTime as any).seconds * 1000 || now;
        
      const endTime = start + (session.duration * 1000);
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      return remaining;
    };

    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);
    setIsActive(initialTime > 0);

    if (initialTime > 0) {
      // Start Ambient Tone
      AudioEngine.play('/sounds/ambient-drone-432hz.mp3'); // Placeholder path
      // Fade in
      AudioEngine.setVolume(0.5);
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        setIsActive(false);
        setCompleted(true);
        AudioEngine.stop();
        setTimeout(() => {
          onComplete();
        }, 3000); // Show completion message for 3s
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      AudioEngine.stop();
    };
  }, [session]);

  if (!session && !completed) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0F1115] transition-opacity duration-1000 ${isActive || completed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Ambient Visuals */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent-primary/10 to-transparent animate-pulse duration-[4000ms]" />
      
      <div className="relative z-10 text-center space-y-8 p-6">
        {completed ? (
          <div className="space-y-4 animate-in fade-in zoom-in duration-1000">
            <div className="w-20 h-20 rounded-full bg-accent-glow mx-auto blur-xl opacity-50" />
            <h2 className="text-3xl font-light text-white tracking-widest">CONNECTED</h2>
            <p className="text-accent-primary/80 text-sm tracking-widest uppercase">Momentum Built</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-accent-primary uppercase tracking-[0.2em] animate-pulse">Silent Session</h3>
              <p className="text-white/50 text-xs">
                {session?.activeParticipants} members present
              </p>
            </div>

            <div className="relative">
              {/* Breathing Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-white/10 animate-[spin_15s_linear_infinite_reverse]" />
              
              <div className="text-6xl font-light text-white tabular-nums tracking-wider">
                {formatTime(timeLeft)}
              </div>
            </div>

            <p className="text-white/60 font-light italic">
              Breathe together. simply be.
            </p>
            
            <button 
              onClick={onClose}
              className="mt-12 text-xs text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors"
            >
              Leave Quietly
            </button>
          </>
        )}
      </div>
    </div>
  );
};
