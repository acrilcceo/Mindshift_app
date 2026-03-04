import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';

// 🔹 MindState Interface
export interface MindState {
  mood: "calm" | "anxious" | "focused" | "low" | "neutral";
  energy: "low" | "mid" | "high";
  auraLevel: number;
  streakCount: number;
  lastRitual: string | null;
}

// 🔹 Initial State
const initialState: MindState = {
  mood: "neutral",
  energy: "mid",
  auraLevel: 0,
  streakCount: 0,
  lastRitual: null,
};

// 🔹 Actions
type MindAction =
  | { type: 'SET_MOOD'; payload: MindState['mood'] }
  | { type: 'SET_ENERGY'; payload: MindState['energy'] }
  | { type: 'INCREMENT_STREAK' }
  | { type: 'UPDATE_AURA'; payload: number }
  | { type: 'SET_LAST_RITUAL'; payload: string }
  | { type: 'RESET_DAILY' }; // Optional: Reset daily stats if needed

// 🔹 Reducer
const mindReducer = (state: MindState, action: MindAction): MindState => {
  switch (action.type) {
    case 'SET_MOOD':
      return { ...state, mood: action.payload };
    case 'SET_ENERGY':
      return { ...state, energy: action.payload };
    case 'INCREMENT_STREAK': {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = state.lastRitual ? state.lastRitual.split('T')[0] : null;

      if (lastDate === today) {
        return state;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      const newCount = (lastDate === yesterdayString) ? state.streakCount + 1 : 1;
      
      return { 
        ...state, 
        streakCount: newCount,
        lastRitual: new Date().toISOString()
      };
    }
    case 'UPDATE_AURA':
      return { ...state, auraLevel: action.payload };
    case 'SET_LAST_RITUAL':
      return { ...state, lastRitual: action.payload };
    case 'RESET_DAILY':
      // Example reset logic (if implemented)
      return { ...state, auraLevel: Math.max(0, state.auraLevel - 1) };
    default:
      return state;
  }
};

// 🔹 Context Creation
const MindContext = createContext<{
  state: MindState;
  dispatch: React.Dispatch<MindAction>;
} | undefined>(undefined);

// 🔹 Provider Component
export const MindProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lazy Initializer for LocalStorage Hydration
  const [state, dispatch] = useReducer(mindReducer, initialState, (initial) => {
    try {
      const stored = localStorage.getItem('mindshift_state_v1');
      return stored ? JSON.parse(stored) : initial;
    } catch (error) {
      console.error('Failed to load mind state', error);
      return initial;
    }
  });

  // Persist to LocalStorage on Change
  useEffect(() => {
    try {
      localStorage.setItem('mindshift_state_v1', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save mind state', error);
    }
  }, [state]);

  // Memoize Context Value
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <MindContext.Provider value={value}>{children}</MindContext.Provider>;
};

// 🔹 Custom Hook
export const useMind = () => {
  const context = useContext(MindContext);
  if (!context) {
    throw new Error('useMind must be used within a MindProvider');
  }
  return context;
};
