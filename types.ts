
export type Mood = 'Radiant' | 'Balanced' | 'Quiet' | 'Challenged' | 'Heavy';
export type Theme = 'light' | 'dark';

export type SoundCategory = 'frequency' | 'binaural' | 'isochronic' | 'ambient' | 'chantVoice';
export type SoundUsageMode = 'sleep' | 'focus' | 'calm' | 'meditation' | 'energy';
export type EmotionalState = 'anxiety' | 'overthinking' | 'sadness' | 'melancholy' | 'panic' | 'stress';

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

export interface SoundAsset {
  id: string;
  category: SoundCategory;
  title: string;
  description: string;
  supportTag: string;
  emotionalTags: EmotionalState[];
  sourceType: 'file' | 'generated';
  url?: string;
  loop: boolean;
  metadata?: {
    frequencyHz?: number;
    binauralBand?: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';
    isochronicPreset?: 'focus' | 'calm' | 'energy' | 'deep_rest';
    recommendedUsage?: SoundUsageMode[];
    recommendedCopy?: string;
  };
}

export type SoundLayerType = 'baseFrequency' | 'ambient' | 'binaural' | 'isochronic' | 'chantVoice';

export interface SoundLayer {
  id: string;
  layerType: SoundLayerType;
  assetId: string;
  volume: number;
  muted: boolean;
  fadeInMs: number;
  fadeOutMs: number;
}

export interface SoundMix {
  id: string;
  name: string;
  layers: SoundLayer[];
  usageMode: SoundUsageMode;
  emotionalState?: EmotionalState;
  loop: boolean;
  createdFromSuggestion: boolean;
  createdAt: number;
}

export interface SoundListeningSession {
  id: string;
  mixId: string;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  usageMode: SoundUsageMode;
  emotionalState?: EmotionalState;
  isCalming: boolean;
  layersUsed: { layerType: SoundLayerType; assetId: string }[];
}

export interface SoundPreferences {
  lastPlayedMixId?: string;
  lastPlayedAt?: number;
  todayListeningMs: number;
  headphonePromptShown: boolean;
  batterySaver: boolean;
}

export interface WhisperGoalAnchor {
  goalId: string;
  mixId: string;
  playCount: number;
}

export interface SoundAnalyticsProfile {
  firstSessionAt?: number;
  totalListeningMs: number;
  frequencyUsageMs: Record<string, number>;
  emotionalUsageMs: Record<EmotionalState, number>;
  sleepVsFocusMs: { sleep: number; focus: number };
  mostRegulatingPattern?: { description: string; computedAt: number };
}

export type MarketplaceCategoryId =
  | 'ritual_tools'
  | 'protection_grounding'
  | 'sleep_calm'
  | 'focus_energy';

export interface MarketplaceProduct {
  id: string;
  title: string;
  categoryId: MarketplaceCategoryId;
  imageUrl: string;
  shortDescription: string;
  oftenUsedFor: string;
  ritualTags: Array<'555' | '369' | 'soundshift' | 'whisper' | 'release' | 'journal'>;
  sellerName: string;
  ratingAverage: number;
  ratingCount: number;
  priceCents: number;
  currency: string;
  isFeatured?: boolean;
}

export interface MarketplaceCartItem {
  productId: string;
  quantity: number;
  priceCentsAtAdd: number;
}

export interface MarketplaceCart {
  items: MarketplaceCartItem[];
  subtotalCents: number;
  totalCents: number;
  currency: string;
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
  soundMixes?: SoundMix[];
  soundSessions?: SoundListeningSession[];
  soundPreferences?: SoundPreferences;
  whisperGoalAnchors?: WhisperGoalAnchor[];
  soundAnalytics?: SoundAnalyticsProfile;
  marketplaceCart?: MarketplaceCart;
  wishlistProductIds?: string[];
}
