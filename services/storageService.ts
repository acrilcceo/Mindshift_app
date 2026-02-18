
import { AppState } from '../types';

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
  userAffirmations: []
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
