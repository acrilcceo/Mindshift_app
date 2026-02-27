import type { RiskLevel } from "./reframingEngine";

export const riskPresetMap: Record<RiskLevel, string> = {
  low: "focus",
  moderate: "ground",
  elevated: "deep_rest",
  high: "deep_rest"
};

export function getSoundSuggestion(riskLevel: RiskLevel): string {
  return riskPresetMap[riskLevel];
}

export function getRecommendedDurationMinutes(riskLevel: RiskLevel): number | null {
  if (riskLevel === "high") return 30;
  return null;
}

