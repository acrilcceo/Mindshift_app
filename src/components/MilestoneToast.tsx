import React, { useEffect, useState } from 'react';

interface MilestoneToastProps {
  streak: number;
  message: string;
  onDismiss: () => void;
}

const MilestoneToast: React.FC<MilestoneToastProps> = ({ streak, message, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slight delay for entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto dismiss after 4 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 500); // Wait for exit animation
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [onDismiss]);

  return (
    <div 
      className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <div className="card-base px-6 py-4 rounded-2xl flex flex-col items-center gap-1 min-w-[200px]">
        <span className="text-xs text-muted uppercase tracking-widest font-medium">
          11:11 Streak: {streak} days
        </span>
        <span className="text-sm text-primary font-serif tracking-wide">
          {message}
        </span>
      </div>
    </div>
  );
};

export default MilestoneToast;
