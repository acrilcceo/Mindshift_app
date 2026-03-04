import React, { useState, useEffect } from 'react';
import { useMind } from '../context/MindContext';
import AudioEngine from '../services/AudioEngine';
import { getAuraStyles } from '../utils/auraStyles';

interface RitualOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const RitualOverlay: React.FC<RitualOverlayProps> = ({ isOpen, onClose, onComplete }) => {
  const { state, dispatch } = useMind();
  const [step, setStep] = useState<'intro' | 'breathing' | 'intent'>('intro');
  const [breathCount, setBreathCount] = useState(0);

  // Aura visual effects
  const auraStyles = getAuraStyles(state.auraLevel);

  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setBreathCount(0);
      AudioEngine.play('/sounds/ocean.mp3', true, 3); // Soft ambient tone
      
      // Auto-advance to breathing after intro
      const timer = setTimeout(() => {
        setStep('breathing');
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      AudioEngine.stop(2);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'breathing') {
      // 3 breaths, 6 seconds each = 18 seconds
      // We can simulate this with a simple timeout loop or just one long timeout if we trust CSS
      const breathTimer = setInterval(() => {
        setBreathCount(prev => {
          if (prev >= 2) {
            clearInterval(breathTimer);
            setStep('intent');
            return prev + 1;
          }
          return prev + 1;
        });
      }, 6000);

      return () => clearInterval(breathTimer);
    }
  }, [step]);

  const handleIntentSelect = (intent: string) => {
    // Update Context
    dispatch({ type: 'INCREMENT_STREAK' });
    dispatch({ type: 'UPDATE_AURA', payload: state.auraLevel + 1 });
    
    // Play success sound (optional, maybe just a chime)
    // AudioEngine.play('/sounds/chime.mp3', false); 

    if (onComplete) onComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Ambient Background */}
      <div className={`absolute inset-0 bg-surface-elevated/95 dark:bg-darkSurface-base/95 backdrop-blur-xl transition-all duration-1000 ${auraStyles.background}`} />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md p-8 text-center text-textPrimary-light dark:text-textPrimary-dark">
        
        {/* Step 1: Intro */}
        {step === 'intro' && (
          <div className="animate-fade-in flex flex-col items-center gap-4">
            <h2 className="text-3xl font-serif tracking-wide text-textPrimary-light dark:text-textPrimary-dark">Pause.</h2>
            <p className="text-textSecondary-light dark:text-textSecondary-dark text-lg">Disconnect to reconnect.</p>
          </div>
        )}

        {/* Step 2: Breathing */}
        {step === 'breathing' && (
          <div className="flex flex-col items-center gap-8 animate-fade-in">
            <div className="relative">
              {/* Breathing Circle */}
              <div 
                className={`w-48 h-48 rounded-full bg-gradient-to-tr from-accent-primary/20 to-accent-secondary/20 blur-xl transition-transform duration-[6000ms] ease-in-out ${auraStyles.avatar}`}
                style={{ 
                  animation: 'breathe 6s ease-in-out infinite' 
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-light tracking-widest text-textPrimary-light dark:text-textPrimary-dark">Breathe</span>
              </div>
            </div>
            <p className="text-textSecondary-light dark:text-textSecondary-dark text-sm tracking-wide">Inhale... Exhale...</p>
          </div>
        )}

        {/* Step 3: Intent Selector */}
        {step === 'intent' && (
          <div className="animate-fade-in w-full">
            <h3 className="text-2xl font-serif mb-8 text-textPrimary-light dark:text-textPrimary-dark">Set your intention</h3>
            <div className="flex flex-col gap-4">
              {['Clarity', 'Peace', 'Strength', 'Gratitude'].map((intent) => (
                <button
                  key={intent}
                  onClick={() => handleIntentSelect(intent)}
                  className="w-full py-4 px-6 rounded-xl bg-surface-muted dark:bg-darkSurface-muted border border-card-border hover:bg-surface-elevated dark:hover:bg-darkSurface-elevated hover:border-accent-primary/50 transition-all duration-300 text-lg tracking-wide text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark"
                >
                  {intent}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Global CSS for breathing animation if not in tailwind */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};

export default RitualOverlay;
