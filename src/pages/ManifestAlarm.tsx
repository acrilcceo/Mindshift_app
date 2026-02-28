import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState, ManifestationSettings } from '../types';

interface ManifestAlarmProps {
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

const ManifestAlarm: React.FC<ManifestAlarmProps> = ({ state, onUpdate }) => {
  const navigate = useNavigate();
  const settings = state.manifestationSettings || {
    enabled: false,
    timeAM: false,
    timePM: false,
    customAffirmation: "I am aligned with my highest purpose.",
    soundEnabled: true,
    ritualMode: 'quick'
  };

  const updateSettings = (updates: Partial<ManifestationSettings>) => {
    onUpdate({
      manifestationSettings: {
        ...settings,
        ...updates
      }
    });
  };

  return (
    <div className="space-y-8 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-card-border transition-colors text-muted"
        >
          ← Back
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-serif text-primary font-bold">11:11 Alarm</h1>
          <p className="text-muted text-xs uppercase tracking-widest">Manifestation Tech</p>
        </div>
      </div>

      {/* Main Toggle Card */}
      <div className="p-6 rounded-3xl glass-card border border-card-border shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-primary">Enable Manifestation</h3>
            <p className="text-sm text-muted">Activate the 11:11 alignment ritual.</p>
          </div>
          <button
            onClick={() => updateSettings({ enabled: !settings.enabled })}
            className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${
              settings.enabled ? 'bg-accent-primary' : 'bg-card-border'
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${
              settings.enabled ? 'left-7' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Timing Selection */}
        {settings.enabled && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
             <button
                onClick={() => updateSettings({ timeAM: !settings.timeAM })}
                className={`p-4 rounded-2xl border transition-all ${
                  settings.timeAM 
                    ? 'bg-accent-primary/10 border-accent-primary text-accent-primary' 
                    : 'bg-card border-card-border text-muted hover:bg-card/80'
                }`}
             >
               <span className="block text-2xl font-bold mb-1">11:11 AM</span>
               <span className="text-xs uppercase tracking-wider">Morning Light</span>
             </button>

             <button
                onClick={() => updateSettings({ timePM: !settings.timePM })}
                className={`p-4 rounded-2xl border transition-all ${
                  settings.timePM 
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                    : 'bg-card border-card-border text-muted hover:bg-card/80'
                }`}
             >
               <span className="block text-2xl font-bold mb-1">11:11 PM</span>
               <span className="text-xs uppercase tracking-wider">Night Shift</span>
             </button>
          </div>
        )}
      </div>

      {/* Customization Settings */}
      {settings.enabled && (
        <div className="space-y-6 animate-fade-in delay-100">
          
          <div className="p-6 rounded-3xl glass-card border border-card-border space-y-4">
             <label className="block text-sm font-bold text-primary uppercase tracking-wider">
               Custom Affirmation
             </label>
             <textarea
               value={settings.customAffirmation}
               onChange={(e) => updateSettings({ customAffirmation: e.target.value })}
               className="w-full p-4 rounded-xl bg-secondary/50 border border-card-border focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none transition-all text-primary font-serif italic"
               rows={3}
               placeholder="Enter your intention..."
             />
             <p className="text-xs text-muted">This will appear on your screen at 11:11.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ritual Mode */}
            <div className="p-6 rounded-3xl glass-card border border-card-border space-y-4">
               <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Ritual Mode</h3>
               <div className="flex bg-secondary/50 p-1 rounded-xl">
                 <button
                   onClick={() => updateSettings({ ritualMode: 'quick' })}
                   className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                     settings.ritualMode === 'quick' ? 'bg-card shadow-sm text-primary' : 'text-muted hover:text-secondary'
                   }`}
                 >
                   Quick (3 Breaths)
                 </button>
                 <button
                   onClick={() => updateSettings({ ritualMode: 'deep' })}
                   className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                     settings.ritualMode === 'deep' ? 'bg-card shadow-sm text-primary' : 'text-muted hover:text-secondary'
                   }`}
                 >
                   Deep (1 Min)
                 </button>
               </div>
            </div>

            {/* Sound Toggle */}
            <div className="p-6 rounded-3xl glass-card border border-card-border flex items-center justify-between">
               <div>
                 <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Sound Chime</h3>
                 <p className="text-xs text-muted mt-1">Soft 528Hz bell on trigger</p>
               </div>
               <button
                  onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`w-12 h-7 rounded-full transition-colors duration-300 relative ${
                    settings.soundEnabled ? 'bg-accent-secondary' : 'bg-card-border'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    settings.soundEnabled ? 'left-6' : 'left-1'
                  }`} />
                </button>
            </div>
          </div>

        </div>
      )}

      {/* Info / Disclaimer */}
      <div className="text-center space-y-4 pt-8 opacity-60">
        <button
          onClick={() => updateSettings({ manualTriggerTimestamp: Date.now() })}
          className="text-xs text-accent-primary underline hover:text-accent-secondary transition-colors"
        >
          Test Ritual Flow
        </button>
        
        <p className="text-xs text-muted uppercase tracking-widest">
          MindShift Technology
        </p>
        <p className="text-[10px] text-muted max-w-xs mx-auto">
          The 11:11 alarm is a gentle reminder to align your thoughts. It functions best when the app is open or running in the background.
        </p>
      </div>

    </div>
  );
};

export default ManifestAlarm;
