import { useState, useEffect, useRef } from 'react';
import { AppState } from '../types';

export const useManifestationTimer = (state: AppState, onUpdate: (updates: Partial<AppState>) => void) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const settings = state.manifestationSettings;
  const lastTriggerRef = useRef<number>(settings?.lastTriggered || 0);

  // Sync ref with settings (in case updated elsewhere)
  useEffect(() => {
    if (settings?.lastTriggered) {
      lastTriggerRef.current = settings.lastTriggered;
    }
  }, [settings?.lastTriggered]);

  useEffect(() => {
    if (!settings?.enabled) return;

    // Request notification permission on mount if enabled
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      const is1111AM = hours === 11 && minutes === 11 && settings.timeAM;
      const is1111PM = hours === 23 && minutes === 11 && settings.timePM;

      if (is1111AM || is1111PM) {
        // Check if already triggered recently (within last 2 minutes to be safe)
        const diff = now.getTime() - lastTriggerRef.current;
        
        if (diff > 120000) { // 2 minutes buffer
          triggerAlarm();
        }
      }
    };

    const triggerAlarm = () => {
      const now = Date.now();
      lastTriggerRef.current = now;
      setIsModalOpen(true);
      
      // Update persistent state to prevent re-trigger on reload
      onUpdate({
        manifestationSettings: {
          ...settings,
          lastTriggered: now
        }
      });

      // Browser Notification
      if (Notification.permission === "granted") {
        new Notification("11:11 – Set Your Intention", {
           body: "Pause. Breathe. Align your thought.",
           icon: "/favicon.ico",
           silent: !settings.soundEnabled
        });
      }
    };

    const interval = setInterval(checkTime, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [settings, onUpdate]);

  return { isModalOpen, setIsModalOpen };
};
