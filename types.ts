
export type Mood = 'Radiant' | 'Balanced' | 'Quiet' | 'Challenged' | 'Heavy';
export type Theme = 'light' | 'dark';

export type AffirmationCategory = 'Gratitude' | 'Self-Love' | 'Success' | 'Health' | 'Relationships' | 'Custom';
export type ReminderFrequency = 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Custom';

export interface AffirmationVersion {
  text: string;
  timestamp: number;
}

export interface UserAffirmation {
  id: string;
  text: string;
  category: AffirmationCategory;
  reminder: {
    frequency: ReminderFrequency;
    days?: number[];
  };
  createdAt: number;
  updatedAt: number;
  useCount: number;
  versions: AffirmationVersion[];
}

export interface BeliefRecord {
  id: string;
  original: string;
  reframed: string;
  timestamp: number;
}

export interface Tracker369 {
  date: string;
  morning: string[];
  afternoon: string[];
  night: string[];
}

export interface Module555 {
  id: string;
  affirmation: string;
  currentDay: number;
  progress: number[]; // Array of 5 numbers, each tracking current count for that day (0-55)
  isCompleted: boolean;
  startDate: number;
}

export interface FTBAEntry {
  id: string;
  timestamp: number;
  feel: string;
  trigger: string;
  belief: string;
  action: string;
}

export interface DailyGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface BreathingSession {
  id: string;
  timestamp: number;
  durationSeconds: number;
  cycles: number;
}

export interface WhisperGoal {
  id: string;
  text: string;
  targetPerson: string;
  timestamp: number;
}

export interface AppState {
  streak: number;
  lastVisit: number;
  moodHistory: { date: string; mood: Mood }[];
  beliefs: BeliefRecord[];
  tracker369: Tracker369[];
  module555: Module555 | null;
  ftbaEntries: FTBAEntry[];
  dailyAffirmation: string[] | null;
  gratitudeList: string[];
  dailyGoals: DailyGoal[];
  breathingSessions: BreathingSession[];
  whisperGoals: WhisperGoal[];
  theme: Theme;
  userAffirmations?: UserAffirmation[];
}
