const TEMPLATES = [
  "I {verb} {quality} in every {context}.",
  "With ease, I {verb} and allow {outcome}.",
  "I am becoming someone who {identity_shift}.",
  "Every day, I choose {behavior} over {old_pattern}.",
  "I honor my {domain} by choosing {behavior} with {quality}.",
  "I let {old_pattern} dissolve as I {verb} {quality}.",
  "In this {context}, I remember I am {identity_shift}.",
  "I gently {verb} {quality} and trust my next step.",
  "I am safe to {verb} and receive {outcome}.",
  "I move through each {context} as someone who {identity_shift}."
];

const VERBS_BASE = [
  "attract",
  "cultivate",
  "embody",
  "radiate",
  "invite",
  "allow",
  "choose",
  "ground",
  "soften",
  "expand",
  "stabilize",
  "restore",
  "elevate"
];

const QUALITIES_BASE = [
  "confidence",
  "clarity",
  "abundance",
  "peace",
  "alignment",
  "ease",
  "trust",
  "focus",
  "courage",
  "compassion",
  "self-belief"
];

const CONTEXTS_BASE = [
  "conversation",
  "decision",
  "moment",
  "interaction",
  "ritual",
  "day",
  "transition"
];

const IDENTITY_SHIFTS_BASE = [
  "trusts deeply",
  "acts with intention",
  "moves with calm strength",
  "speaks with grounded confidence",
  "chooses aligned action",
  "listens to inner guidance",
  "shows up with quiet power"
];

const BEHAVIORS_BASE = [
  "presence",
  "self-trust",
  "gentle discipline",
  "curiosity",
  "stillness before action",
  "speaking honestly",
  "setting clean boundaries"
];

const OLD_PATTERNS_BASE = [
  "fear",
  "overthinking",
  "self-doubt",
  "rushing",
  "people-pleasing",
  "self-criticism"
];

const MOOD_QUALITIES: Record<string, string[]> = {
  Radiant: ["abundance", "confidence", "joy", "generosity", "expansion"],
  Balanced: ["equilibrium", "steadiness", "clarity", "grounded focus"],
  Quiet: ["calm", "ease", "stillness", "safety", "inner quiet"],
  Challenged: ["resilience", "strength", "courage", "growth"],
  Heavy: ["self-compassion", "forgiveness", "relief", "soft release"]
};

const MOOD_VERBS: Record<string, string[]> = {
  Radiant: ["amplify", "shine", "radiate", "expand"],
  Balanced: ["align", "stabilize", "center", "flow"],
  Quiet: ["soften", "ground", "soothe", "breathe into"],
  Challenged: ["rise", "strengthen", "transmute", "reframe"],
  Heavy: ["release", "unburden", "lighten", "begin again"]
};

function hashSeed(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pickDeterministic<T>(arr: T[], seed: string): T {
  if (arr.length === 0) {
    throw new Error("Cannot pick from empty array");
  }
  const h = hashSeed(seed);
  const idx = h % arr.length;
  return arr[idx];
}

function normalizeContext(context?: string) {
  if (!context) return "";
  return context
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeywords(context?: string) {
  const normalized = normalizeContext(context);
  if (!normalized) {
    return {
      qualities: [] as string[],
      domains: [] as string[],
      identityShifts: [] as string[],
      behaviors: [] as string[]
    };
  }
  const words = Array.from(
    new Set(
      normalized
        .split(" ")
        .filter(w => w.length > 3)
    )
  );
  const qualities: string[] = [];
  const domains: string[] = [];
  const identityShifts: string[] = [];
  const behaviors: string[] = [];
  for (const w of words) {
    if (["confident", "confidence", "brave", "bold"].includes(w)) {
      qualities.push("confidence");
      identityShifts.push("trusts their voice");
    } else if (["calm", "peaceful", "relaxed", "grounded"].includes(w)) {
      qualities.push("calm");
      identityShifts.push("moves with calm strength");
    } else if (["presentation", "presentations", "speaking", "speech"].includes(w)) {
      domains.push("presentations");
      identityShifts.push("speaks with grounded confidence");
    } else if (["relationship", "relationships", "connection"].includes(w)) {
      domains.push("relationships");
    } else if (["health", "body", "energy"].includes(w)) {
      domains.push("health");
    } else if (["focus", "clarity"].includes(w)) {
      qualities.push("clarity");
    } else if (["gratitude", "grateful"].includes(w)) {
      qualities.push("gratitude");
      behaviors.push("noticing small wins");
    } else if (["action", "act", "doing"].includes(w)) {
      behaviors.push("taking one small aligned action");
    }
  }
  return {
    qualities,
    domains,
    identityShifts,
    behaviors
  };
}

const HISTORY_KEY = "affirmation_engine_history_v1";
const REFRESH_KEY_PREFIX = "affirmation_engine_refresh_v1_";
const HISTORY_LIMIT = 30;
const DAILY_VARIANTS = 3;

interface HistoryEntry {
  text: string;
  date: string;
  mood?: string;
  context?: string;
}

function loadHistory(): HistoryEntry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(-HISTORY_LIMIT)));
  } catch {
  }
}

function getDailyVariantIndex(): number {
  if (typeof localStorage === "undefined") return 0;
  const today = new Date().toISOString().slice(0, 10);
  const key = `${REFRESH_KEY_PREFIX}${today}`;
  try {
    const raw = localStorage.getItem(key);
    const value = raw ? parseInt(raw, 10) || 0 : 0;
    const clamped = Math.min(value, DAILY_VARIANTS - 1);
    const next = Math.min(value + 1, DAILY_VARIANTS - 1);
    localStorage.setItem(key, String(next));
    return clamped;
  } catch {
    return 0;
  }
}

function buildAffirmation(seed: string, mood?: string, context?: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const moodKey = mood || "Balanced";
  const moodVerbs = MOOD_VERBS[moodKey] || [];
  const moodQualities = MOOD_QUALITIES[moodKey] || [];
  const keywords = extractKeywords(context);
  const templateSeed = `${seed}|template`;
  const template = pickDeterministic(TEMPLATES, templateSeed);
  const verbPool = [...VERBS_BASE, ...moodVerbs];
  const qualityPool = [...QUALITIES_BASE, ...moodQualities, ...keywords.qualities];
  const contextPool = [...CONTEXTS_BASE, ...(keywords.domains.length ? keywords.domains : [])];
  const identityPool = [...IDENTITY_SHIFTS_BASE, ...keywords.identityShifts];
  const behaviorPool = [...BEHAVIORS_BASE, ...keywords.behaviors];
  const oldPatternPool = [...OLD_PATTERNS_BASE];
  const verb = pickDeterministic(verbPool, `${seed}|verb`);
  const quality = pickDeterministic(qualityPool, `${seed}|quality`);
  const contextWord = pickDeterministic(contextPool, `${seed}|context`);
  const identityShift = pickDeterministic(identityPool, `${seed}|identity`);
  const behavior = pickDeterministic(behaviorPool, `${seed}|behavior`);
  const oldPattern = pickDeterministic(oldPatternPool, `${seed}|oldpattern`);
  const outcomeSeed = `${seed}|outcome`;
  const outcomeTemplate = pickDeterministic(
    [
      `${quality} in my ${contextWord}`,
      `${quality} and quiet confidence`,
      `steady ${quality}`,
      `calm, grounded ${quality}`
    ],
    outcomeSeed
  );
  const replacements: Record<string, string> = {
    "{verb}": verb,
    "{quality}": quality,
    "{context}": contextWord,
    "{identity_shift}": identityShift,
    "{behavior}": behavior,
    "{old_pattern}": oldPattern,
    "{outcome}": outcomeTemplate,
    "{date}": today
  };
  let result = template;
  Object.keys(replacements).forEach(key => {
    result = result.split(key).join(replacements[key]);
  });
  if (!/^i\b/i.test(result.trim())) {
    result = `I ${result.charAt(0).toLowerCase()}${result.slice(1)}`;
  }
  if (!/[.!?]$/.test(result.trim())) {
    result = `${result.trim()}.`;
  }
  return result;
}

export const generateAffirmations = async (mood?: string, context?: string): Promise<string[]> => {
  const today = new Date().toISOString().slice(0, 10);
  const normalizedContext = normalizeContext(context);
  const variantIndex = getDailyVariantIndex();
  const baseSeed = `${today}|${mood || ""}|${normalizedContext}|${variantIndex}`;
  const history = loadHistory();
  const recentTexts = history
    .filter(entry => !!entry.text)
    .slice(-HISTORY_LIMIT)
    .map(entry => entry.text);
  let attempt = 0;
  let chosen = "";
  while (attempt < 5) {
    const seed = `${baseSeed}|${attempt}`;
    const candidate = buildAffirmation(seed, mood, context);
    if (!recentTexts.includes(candidate)) {
      chosen = candidate;
      break;
    }
    chosen = candidate;
    attempt += 1;
  }
  const nextHistory: HistoryEntry[] = [
    ...history,
    {
      text: chosen,
      date: today,
      mood,
      context
    }
  ];
  saveHistory(nextHistory);
  return [chosen];
};

function toPositive(input: string) {
  let s = input.trim();
  const map: [RegExp, string][] = [
    [/\bcan't\b/gi, "can"],
    [/\bwon't\b/gi, "choose to"],
    [/\bnever\b/gi, "always"],
    [/\bnot\b/gi, ""],
    [/\bcannot\b/gi, "can"],
    [/\bafraid\b/gi, "courageous"],
    [/\bweak\b/gi, "strong"],
    [/\black\b/gi, "abundance"],
    [/\bimpossible\b/gi, "possible"]
  ];
  for (const [re, rep] of map) s = s.replace(re, rep);
  s = s.replace(/\s+/g, " ").trim();
  if (!/^i\b/i.test(s)) s = `I ${s}`;
  s = s.replace(/^i\s+/i, "I ");
  if (!/[.!?]$/.test(s)) s += ".";
  const endings = [
    "I am capable, deserving, and ready now.",
    "I choose mastery and abundance now.",
    "I move forward with clarity and trust.",
    "I act in aligned, confident presence."
  ];
  const final = `I transmute that story. ${endings[hashSeed(input) % endings.length]}`;
  return final;
}

export const reframeBelief = async (limitingBelief: string): Promise<string> => {
  return toPositive(limitingBelief);
};

export const generateEmotionalReleasePrompt = async (currentMood: string): Promise<string> => {
  const prompts: Record<string, string> = {
    Radiant: "Hand to heart, breathe gratitude in; exhale warmth. Whisper thank you.",
    Balanced: "Inhale steady, exhale soft. Repeat: I am okay, I am present.",
    Quiet: "Breathe gently and let shoulders drop. You are safe and held.",
    Challenged: "Inhale courage, exhale tension. I forgive and choose clarity.",
    Heavy: "Close eyes, hand on chest. I love you. I release and begin again."
  };
  return prompts[currentMood] || "Breathe in peace, exhale tension.";
};
