import React from 'react';

interface WeeklyConsistencyRingProps {
  streakCount: number;
  size?: number;
  className?: string;
}

export const WeeklyConsistencyRing: React.FC<WeeklyConsistencyRingProps> = ({ 
  streakCount, 
  size = 24,
  className = ''
}) => {
  const totalDots = 7;
  // Calculate filled dots based on streak count (capped at 7 for the ring)
  const filledDots = Math.min(streakCount, totalDots);
  const radius = (size / 2) - 3; // Leave padding for dot radius
  const center = size / 2;
  
  // Generate dots positions in a circle
  const dots = Array.from({ length: totalDots }).map((_, i) => {
    const angle = (i * (360 / totalDots)) - 90; // Start from top
    const radian = (angle * (Math.PI / 180)); // Convert to radians
    const x = center + radius * Math.cos(radian);
    const y = center + radius * Math.sin(radian);
    const isFilled = i < filledDots;
    
    return { x, y, isFilled };
  });

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {dots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={1.5}
            className={`transition-colors duration-300 ${
              dot.isFilled 
                ? 'fill-accent-primary drop-shadow-[0_0_2px_rgba(168,139,250,0.5)]' 
                : 'fill-gray-700/50'
            }`}
          />
        ))}
      </svg>
    </div>
  );
};
