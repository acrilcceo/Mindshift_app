import type { RiskLevel } from "./reframingEngine";
import { soundMixEngine } from "./soundMixEngine";

export const SLEEP_TIMER_OPTIONS_MINUTES = [10, 20, 30, 60];

export function startSleepTimer(minutes: number): void {
  soundMixEngine.startSleepTimer(minutes);
}

export function cancelSleepTimer(): void {
  soundMixEngine.cancelSleepTimer();
}

export function getDefaultSleepMinutesForRisk(riskLevel: RiskLevel): number | null {
  if (riskLevel === "high") return 30;
  return null;
}

