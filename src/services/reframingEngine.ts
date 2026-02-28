import { domainKeywords, ReframeDomain } from "./reframingLibrary";
import { negativeWords, positiveWords } from "./sentimentLexicon";
import { themeKeywords } from "./themeLibrary";
import { themeClusters } from "./themeClusters";
import { extremeNegativeWords } from "./riskLexicon";
import { storageGet, storageSet } from "./store";
import { getSoundSuggestion, getRecommendedDurationMinutes } from "./soundRiskMapping";

export type NegativePattern =
  | "self_doubt"
  | "permanence"
  | "scarcity"
  | "failure_identity"
  | "comparison"
  | "unknown";

export type RiskLevel =
  | "low"
  | "moderate"
  | "elevated"
  | "high";

export type ReframeResult = {
  reframed: string;
  domain: ReframeDomain;
  pattern: NegativePattern;
  confidence: number;
  sentiment: number;
  intensity: number;
  themes: string[];
  clusters: string[];
  riskLevel: RiskLevel;
  suggestCalmingSound: boolean;
  suggestedPresetId: string | null;
  suggestedDurationMinutes: number | null;
};

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter(Boolean);
}

function calculateSentiment(input: string): number {
  const tokens = tokenize(input);
  let score = 0;

  tokens.forEach(token => {
    if (negativeWords[token]) score += negativeWords[token];
    if (positiveWords[token]) score += positiveWords[token];
  });

  return Math.max(-100, Math.min(100, score));
}

function calculateIntensity(input: string, sentiment: number): number {
  let intensity = Math.abs(sentiment);
  const lower = input.toLowerCase();

  if (lower.includes("always") || lower.includes("never")) {
    intensity += 15;
  }

  return Math.min(100, intensity);
}

export function extractSubject(input: string): string {
  const lower = input.toLowerCase();

  const amNotMatch = lower.match(/i am not (.+)/);
  if (amNotMatch) return amNotMatch[1].trim();

  const neverMatch = lower.match(/i will never (.+)/);
  if (neverMatch) return neverMatch[1].trim();

  const alwaysMatch = lower.match(/i always (.+)/);
  if (alwaysMatch) return alwaysMatch[1].trim();

  const myMatch = lower.match(/my (.+?) (is|are|keeps)/);
  if (myMatch) return myMatch[1].trim();

  return input.trim();
}

export function detectPattern(input: string): NegativePattern {
  const lower = input.toLowerCase();

  if (lower.includes("never")) return "permanence";
  if (lower.includes("always")) return "failure_identity";
  if (lower.includes("not")) return "self_doubt";
  if (lower.includes("can't") || lower.includes("cannot")) return "self_doubt";
  if (lower.includes("enough")) return "scarcity";

  return "unknown";
}

export function detectDomain(input: string): ReframeDomain {
  const lowered = input.toLowerCase();
  for (const domain in domainKeywords) {
    const key = domain as ReframeDomain;
    if (domainKeywords[key].some((word: string) => lowered.includes(word))) {
      return key;
    }
  }
  return "mindset";
}

export function detectThemes(input: string): string[] {
  const detected: string[] = [];
  const lower = input.toLowerCase();

  for (const theme in themeKeywords) {
    if (themeKeywords[theme].some(keyword => lower.includes(keyword))) {
      detected.push(theme);
    }
  }

  return detected;
}

function detectClusters(themes: string[]): string[] {
  const clusters: string[] = [];

  for (const cluster in themeClusters) {
    if (themeClusters[cluster].some(theme => themes.includes(theme))) {
      clusters.push(cluster);
    }
  }

  return clusters;
}

type ThemeStats = {
  [theme: string]: number;
};

type ClusterStats = {
  [cluster: string]: number;
};

const THEME_STATS_KEY = "reframer_theme_stats_v1";
const CLUSTER_STATS_KEY = "reframer_cluster_stats_v1";

function loadThemeStats(): ThemeStats {
  const stats = storageGet(THEME_STATS_KEY);
  if (!stats || typeof stats !== "object") return {};
  return stats as ThemeStats;
}

function saveThemeStats(stats: ThemeStats) {
  storageSet(THEME_STATS_KEY, stats);
}

function loadClusterStats(): ClusterStats {
  const stats = storageGet(CLUSTER_STATS_KEY);
  if (!stats || typeof stats !== "object") return {};
  return stats as ClusterStats;
}

function saveClusterStats(stats: ClusterStats) {
  storageSet(CLUSTER_STATS_KEY, stats);
}

const patternTemplates: Record<NegativePattern, string[]> = {
  permanence: [
    "My past experience with {subject} does not define my future. I am learning new ways to grow in this area.",
    "What has happened around {subject} so far is not the final story. I am opening to new outcomes.",
    "I am allowed to create different results with {subject} as I gain new skills and support."
  ],
  self_doubt: [
    "I am developing confidence in my ability to improve {subject}. Growth is a process I am committed to.",
    "I am learning to trust myself more around {subject} with every small step I take.",
    "I am building evidence that I am capable of progress with {subject}, even if it feels slow."
  ],
  scarcity: [
    "There are new opportunities expanding around {subject}, and I am learning how to access them.",
    "I am beginning to notice more possibilities related to {subject} than I saw before.",
    "I am training my mind to see abundance and options around {subject} instead of lack."
  ],
  failure_identity: [
    "Each experience with {subject} is refining my skill and awareness. I am progressing steadily.",
    "My attempts with {subject} are practice, not proof against me. I am getting better.",
    "I am allowed to separate my identity from past outcomes with {subject} and keep improving."
  ],
  comparison: [
    "My path with {subject} does not need to look like anyone else’s. I am allowed my own pace.",
    "I am learning to measure my growth in {subject} against who I was yesterday, not others.",
    "I am focusing on my unique strengths around {subject} instead of comparing."
  ],
  unknown: [
    "I am capable of evolving beyond my current story about {subject}.",
    "I am open to seeing {subject} through a kinder, more empowering lens.",
    "I am learning to rewrite how I speak to myself about {subject}."
  ]
};

function fillTemplate(template: string, subject: string, domain: ReframeDomain): string {
  const trimmedSubject = subject.trim() || "this area of my life";
  let result = template.replace(/\{subject\}/g, trimmedSubject);
  result = result.replace(/\{domain\}/g, domain);
  return result.trim();
}

function buildReframe(subject: string, pattern: NegativePattern, domain: ReframeDomain): string {
  const templates = patternTemplates[pattern] || patternTemplates.unknown;
  if (!templates.length) {
    return `I am capable of evolving beyond my current story about ${subject || "this area of my life"}.`;
  }
  const index = Math.floor(Math.random() * templates.length);
  return fillTemplate(templates[index], subject, domain);
}

function calculateConfidence(subject: string, pattern: NegativePattern, domain: ReframeDomain): number {
  let score = 0;
  if (subject && subject.length > 3) score += 30;
  if (pattern !== "unknown") score += 35;
  if (domain !== "mindset") score += 35;
  return Math.max(0, Math.min(100, score));
}

function detectRiskLevel(
  input: string,
  sentiment: number,
  intensity: number
): RiskLevel {
  const lower = input.toLowerCase();

  const extremeMatch = extremeNegativeWords.some(word =>
    lower.includes(word.toLowerCase())
  );

  if (extremeMatch) return "high";

  if (sentiment <= -70 && intensity > 60) {
    return "high";
  }

  if (sentiment <= -50) {
    return "elevated";
  }

  if (sentiment <= -25) {
    return "moderate";
  }

  return "low";
}

function updateThemeStats(detectedThemes: string[]): ThemeStats {
  const stats = loadThemeStats();

  detectedThemes.forEach(theme => {
    stats[theme] = (stats[theme] || 0) + 1;
  });

  saveThemeStats(stats);
  return stats;
}

function updateClusterStats(clusters: string[]): void {
  const stats = loadClusterStats();

  clusters.forEach(cluster => {
    stats[cluster] = (stats[cluster] || 0) + 1;
  });

  saveClusterStats(stats);
}

function amplifyRiskIfRecurring(
  themes: string[],
  baseRisk: RiskLevel,
  stats: ThemeStats
): RiskLevel {
  const recurring = themes.some(theme => (stats[theme] || 0) >= 5);

  if (!recurring) return baseRisk;

  if (baseRisk === "elevated") return "high";
  if (baseRisk === "moderate") return "elevated";

  return baseRisk;
}

export function getTopRecurringTheme(): string | null {
  const stats = loadThemeStats();
  const entries = Object.entries(stats);
  if (!entries.length) return null;
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

export function getDominantCluster(): string | null {
  const stats = loadClusterStats();
  const entries = Object.entries(stats);
  if (!entries.length) return null;
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

let lastOutputs: string[] = [];

export function reframeBelief(input: string): ReframeResult {
  const subject = extractSubject(input);
  const pattern = detectPattern(input);
  const domain = detectDomain(input);
  const sentiment = calculateSentiment(input);
  const intensity = calculateIntensity(input, sentiment);
  const themes = detectThemes(input);
  const clusters = detectClusters(themes);

  const updatedThemeStats = updateThemeStats(themes);
  updateClusterStats(clusters);

  const baseRisk = detectRiskLevel(input, sentiment, intensity);
  const riskLevel = amplifyRiskIfRecurring(themes, baseRisk, updatedThemeStats);

  let reframed = buildReframe(subject, pattern, domain);
  let attempts = 0;
  while (lastOutputs.includes(reframed) && attempts < 10) {
    reframed = buildReframe(subject, pattern, domain);
    attempts += 1;
  }

  lastOutputs = [...lastOutputs, reframed].slice(-5);

  const confidence = calculateConfidence(subject, pattern, domain);

  const suggestCalmingSound = riskLevel === "elevated" || riskLevel === "high";
  const suggestedPresetId = getSoundSuggestion(riskLevel);
  const suggestedDurationMinutes = getRecommendedDurationMinutes(riskLevel);

  return {
    reframed,
    domain,
    pattern,
    confidence,
    sentiment,
    intensity,
    themes,
    clusters,
    riskLevel,
    suggestCalmingSound,
    suggestedPresetId,
    suggestedDurationMinutes
  };
}
