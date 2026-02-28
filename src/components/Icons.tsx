import React from 'react';

interface IconProps {
  className?: string;
}

const defaultClass = "w-6 h-6 md:w-5 md:h-5 shrink-0";

export const FocusIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <circle cx="12" cy="12" r="6" />
    <path d="M4 12h2" />
    <path d="M18 12h2" />
    <path d="M12 4v2" />
    <path d="M12 18v2" />
  </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const SoundshiftIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <rect x="5" y="9" width="3" height="6" rx="1" />
    <rect x="16" y="9" width="3" height="6" rx="1" />
    <path d="M8 11a4 4 0 0 1 8 0v2" />
    <path d="M5 15a3 3 0 0 0 3 3" />
    <path d="M16 18a3 3 0 0 0 3-3" />
  </svg>
);

export const MarketplaceIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <path d="M5 9h14" />
    <path d="M7 5h10l2 4H5z" />
    <path d="M6 9v8h12V9" />
    <path d="M10 13h4" />
  </svg>
);

export const GuideIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <circle cx="12" cy="7" r="4" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
  </svg>
);

export const ReframerIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <path d="M8 7h8" />
    <path d="M8 12h8" />
    <path d="M8 17h5" />
    <path d="M6 5h12v14H6z" />
  </svg>
);

export const Ritual369Icon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <path d="M6 7h4v4H6z" />
    <path d="M14 7h4v4h-4z" />
    <path d="M10 13h4v4h-4z" />
  </svg>
);

export const Ritual555Icon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <path d="M6 8h4l-1 3h3" />
    <path d="M6 13h4l-1 3h3" />
    <path d="M6 18h4l-1 3h3" />
  </svg>
);

export const VisualizeIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

export const ReleaseIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <path d="M7 18c1-3 2.5-5.5 5-8" />
    <path d="M11 20c1-3 2.5-5.5 5-8" />
    <path d="M6 8c1.5-1 3.5-2 6-2 2.5 0 4.5 1 6 2" />
  </svg>
);

export const JournalIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <path d="M7 4h10v16H7z" />
    <path d="M9 8h6" />
    <path d="M9 12h4" />
    <path d="M5 6v12" />
  </svg>
);

export const ProfileIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <circle cx="12" cy="9" r="3" />
    <path d="M6 19a6 6 0 0 1 12 0" />
  </svg>
);

export const MindIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <path d="M12 2a8 8 0 0 1 8 8c0 3.87-3.13 7-7 7H9a4 4 0 0 1-4-4v-1a4 4 0 0 1 4-4h.5c.28 0 .5-.22.5-.5v-1c0-.28-.22-.5-.5-.5a3 3 0 0 0-3 3" />
    <path d="M15 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  </svg>
);

export const ServiceIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

export const SparkleIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className={`${defaultClass} ${className || ''}`}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);
