import React, { useEffect, useState, useRef } from 'react';
import { ManifestationSettings } from '../types';

interface ManifestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  settings: ManifestationSettings;
}

const ManifestationModal: React.FC<ManifestationModalProps> = ({ isOpen, onClose, onComplete, settings }) => {
  const [stage, setStage] = useState<'intro' | 'breathing' | 'outro'>('intro');
  const [breathCount, setBreathCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  
  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStage('intro');
      setBreathCount(0);
      setBreathPhase('inhale');
      
      if (settings.soundEnabled) {
        playChime();
      }
    }
  }, [isOpen]);

  // Breathing Logic
  useEffect(() => {
    if (stage === 'breathing') {
      let timeout: NodeJS.Timeout;
      
      const cycle = () => {
        setBreathPhase('inhale');
        timeout = setTimeout(() => {
          setBreathPhase('hold');
          timeout = setTimeout(() => {
            setBreathPhase('exhale');
            timeout = setTimeout(() => {
              setBreathCount(prev => {
                const next = prev + 1;
                if (next >= 3 && settings.ritualMode === 'quick') {
                  setStage('outro');
                  if (onComplete) onComplete();
                  return next;
                }
                if (next >= 10 && settings.ritualMode === 'deep') { // Approx 1 min
                  setStage('outro');
                  if (onComplete) onComplete();
                  return next;
                }
                cycle(); // Next cycle
                return next;
              });
            }, 4000); // Exhale 4s
          }, 2000); // Hold 2s
        }, 4000); // Inhale 4s
      };

      cycle();

      return () => clearTimeout(timeout);
    }
  }, [stage, settings.ritualMode]);

  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime); // 528Hz Love Frequency
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 3.1);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur and subtle pulse */}
      <div 
        className="absolute inset-0 bg-primary/95 backdrop-blur-xl transition-all duration-1000"
        onClick={onClose} // Allow clicking outside to close
      />
      
      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center space-y-8 animate-fade-in-up">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-serif text-primary tracking-tighter opacity-90 font-light">
            11:11
          </h1>
          <p className="text-secondary uppercase tracking-[0.3em] text-sm font-medium">
            Your moment to align
          </p>
        </div>

        {/* Dynamic Content based on Stage */}
        <div className="min-h-[200px] flex flex-col items-center justify-center">
          
          {stage === 'intro' && (
            <div className="space-y-8 animate-fade-in">
              <div className="p-6 rounded-2xl bg-card/30 border border-white/10 backdrop-blur-md">
                <p className="text-xl md:text-2xl font-serif italic text-primary leading-relaxed">
                  "{settings.customAffirmation || "I am aligned with my highest purpose."}"
                </p>
              </div>
              
              <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                <button 
                  onClick={() => setStage('breathing')}
                  className="w-full py-4 rounded-xl bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 border border-accent-primary/30 transition-all uppercase tracking-widest text-xs font-bold"
                >
                  Begin Ritual
                </button>
                <button 
                  onClick={onClose}
                  className="text-muted text-xs uppercase tracking-widest hover:text-primary transition-colors py-2"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {stage === 'breathing' && (
            <div className="space-y-8 w-full">
              {/* Breathing Circle */}
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                <div 
                  className={`absolute inset-0 rounded-full border-2 border-accent-primary/30 transition-all duration-[4000ms] ease-in-out
                    ${breathPhase === 'inhale' ? 'scale-110 opacity-100 border-accent-primary' : 
                      breathPhase === 'hold' ? 'scale-110 opacity-80 border-accent-primary' : 
                      'scale-90 opacity-50 border-accent-primary/30'}
                  `}
                />
                <div 
                  className={`absolute inset-0 rounded-full bg-accent-primary/10 blur-xl transition-all duration-[4000ms] ease-in-out
                    ${breathPhase === 'inhale' ? 'scale-125 opacity-100' : 
                      breathPhase === 'hold' ? 'scale-125 opacity-80' : 
                      'scale-75 opacity-20'}
                  `}
                />
                <div className="text-2xl font-serif text-primary animate-fade-in">
                  {breathPhase === 'inhale' && 'Inhale'}
                  {breathPhase === 'hold' && 'Hold'}
                  {breathPhase === 'exhale' && 'Exhale'}
                </div>
              </div>
              
              <p className="text-secondary text-sm tracking-widest uppercase">
                Breath {breathCount + 1} of {settings.ritualMode === 'quick' ? 3 : 10}
              </p>
            </div>
          )}

          {stage === 'outro' && (
            <div className="space-y-8 animate-fade-in">
               <div className="w-20 h-20 mx-auto rounded-full bg-accent-primary/10 flex items-center justify-center text-3xl text-accent-primary mb-4">
                 ✨
               </div>
               <h3 className="text-2xl font-serif text-primary">Aligned.</h3>
               <button 
                  onClick={onClose}
                  className="w-full px-12 py-4 rounded-xl bg-primary text-secondary hover:bg-accent-primary hover:text-white transition-all uppercase tracking-widest text-xs font-bold shadow-lg"
                >
                  Continue Journey
                </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ManifestationModal;
