/**
 * Aura System Utility
 * Maps aura levels to Tailwind CSS classes for visual reinforcement
 */

export const getAuraStyles = (level: number) => {
  // 0-3: Soft glow
  if (level <= 3) {
    return {
      avatar: "shadow-[0_0_15px_rgba(120,90,255,0.15)]",
      background: "bg-transparent",
      container: "",
      text: "text-white/70",
      border: "border-white/10",
    };
  }

  // 4-7: Stronger gradient
  if (level <= 7) {
    return {
      avatar: "shadow-[0_0_25px_rgba(120,90,255,0.25)] ring-1 ring-accent-glow",
      background: "bg-gradient-to-b from-accent-glow/5 to-transparent",
      container: "backdrop-brightness-105",
      text: "text-indigo-300",
      border: "border-indigo-500/30",
    };
  }

  // 8-15: Gentle pulse animation
  if (level <= 15) {
    return {
      avatar: "shadow-[0_0_35px_rgba(168,139,250,0.35)] animate-pulse",
      background: "bg-gradient-to-b from-accent-glow/10 to-transparent",
      container: "backdrop-brightness-110",
      text: "text-purple-300",
      border: "border-purple-500/40",
    };
  }

  // 15+: Ambient background tint
  return {
    avatar: "shadow-[0_0_50px_rgba(168,139,250,0.5)] animate-pulse ring-2 ring-accent-secondary/30",
    background: "bg-accent-glow/5",
    container: "backdrop-brightness-110 shadow-inner shadow-accent-glow/20",
    text: "text-accent-primary",
    border: "border-accent-glow/50",
  };
};

export const getAuraColor = (mood: string) => {
  switch (mood) {
    case 'anxious': return 'text-blue-400 shadow-blue-400/20';
    case 'focused': return 'text-indigo-400 shadow-indigo-400/20';
    case 'low': return 'text-teal-400 shadow-teal-400/20';
    case 'calm': return 'text-purple-400 shadow-purple-400/20';
    default: return 'text-accent-primary shadow-accent-primary/20';
  }
};
