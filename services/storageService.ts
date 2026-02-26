
import { AppState } from '../src/types';

const STORAGE_KEY = 'mindshift_manifest_data_v3';

const initialData: AppState = {
  streak: 0,
  lastVisit: Date.now(),
  moodHistory: [],
  beliefs: [],
  tracker369: [],
  module555: null,
  ftbaEntries: [],
  dailyAffirmation: null,
  gratitudeList: [],
  dailyGoals: [],
  breathingSessions: [],
  whisperGoals: [],
  theme: 'dark',
  userAffirmations: [],
  soundMixes: [],
  soundSessions: [],
  soundPreferences: {
    todayListeningMs: 0,
    headphonePromptShown: false,
    batterySaver: false
  },
  whisperGoalAnchors: [],
  soundAnalytics: {
    totalListeningMs: 0,
    frequencyUsageMs: {},
    emotionalUsageMs: {
      anxiety: 0,
      overthinking: 0,
      sadness: 0,
      melancholy: 0,
      panic: 0,
      stress: 0
    },
    sleepVsFocusMs: {
      sleep: 0,
      focus: 0
    }
  }
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return initialData;
  const parsed = JSON.parse(stored);
  
  // Migration / Safety checks for new fields
  if (!parsed.dailyGoals) parsed.dailyGoals = [];
  if (!parsed.breathingSessions) parsed.breathingSessions = [];
  if (!parsed.whisperGoals) parsed.whisperGoals = [];
  if (!parsed.theme) parsed.theme = 'dark';
  if (!parsed.userAffirmations) parsed.userAffirmations = [];
  if (!parsed.soundMixes) parsed.soundMixes = [];
  if (!parsed.soundSessions) parsed.soundSessions = [];
  if (!parsed.soundPreferences) {
    parsed.soundPreferences = {
      todayListeningMs: 0,
      headphonePromptShown: false,
      batterySaver: false
    };
  }
  if (!parsed.whisperGoalAnchors) parsed.whisperGoalAnchors = [];
  if (!parsed.soundAnalytics) {
    parsed.soundAnalytics = {
      totalListeningMs: 0,
      frequencyUsageMs: {},
      emotionalUsageMs: {
        anxiety: 0,
        overthinking: 0,
        sadness: 0,
        melancholy: 0,
        panic: 0,
        stress: 0
      },
      sleepVsFocusMs: {
        sleep: 0,
        focus: 0
      }
    };
  }
  
  // Basic streak logic
  const lastVisitDate = new Date(parsed.lastVisit).toDateString();
  const today = new Date().toDateString();
  
  if (lastVisitDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastVisitDate === yesterday.toDateString()) {
      parsed.streak += 1;
    } else {
      parsed.streak = 1;
    }
    parsed.lastVisit = Date.now();
    parsed.dailyAffirmation = null; // Reset for new day
    parsed.dailyGoals = parsed.dailyGoals.filter((g: any) => !g.completed); 
  }
  
  return parsed;
};

export const storageGet = (key: string): any => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const storageSet = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
};
