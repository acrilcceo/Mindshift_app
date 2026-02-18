const baseAffirmations = [
  "I magnetize wealth with calm certainty.",
  "I move with disciplined, joyful action.",
  "I am in perfect, vibrant health now.",
  "My mind is clear, focused, and sovereign.",
  "Opportunity finds me and I respond with mastery.",
  "I lead my life with courage and grace.",
  "I am the source of abundance in my world.",
  "I create momentum through aligned choices.",
  "I am a calm force of excellence.",
  "I trust myself and act decisively.",
  "I receive with ease and give generously.",
  "I embody clarity, power, and presence.",
  "My vision is bold and my actions precise.",
  "I turn intention into reality daily.",
  "I am safe, supported, and unstoppable.",
  "I upgrade my identity with every breath.",
  "I attract extraordinary opportunities now.",
  "I am disciplined, centered, and free.",
  "I speak with confidence and warmth.",
  "I honor my body and nourish my energy.",
  "I am a beacon for success and impact.",
  "I choose mastery over distraction.",
  "I am grateful for wealth in all forms.",
  "I execute my plan with elegant focus.",
  "I am worthy of every good thing.",
  "I move through life in effortless flow.",
  "I turn challenges into wisdom instantly.",
  "I am present, powerful, and at ease.",
  "I celebrate small wins and compound them.",
  "I embody abundance, health, and joy.",
  "I am consistent, courageous, and creative.",
  "I direct my attention to what matters.",
  "I let success arrive and stay.",
  "I breathe calm into every space I enter.",
  "I am disciplined enough to be free.",
  "I am the architect of my reality.",
  "I radiate trust, clarity, and compassion."
];

const moodVerbs: Record<string, string[]> = {
  Radiant: ["expand", "shine", "amplify", "elevate"],
  Balanced: ["stabilize", "center", "align", "flow"],
  Quiet: ["soften", "restore", "listen", "ground"],
  Challenged: ["rise", "strengthen", "learn", "transmute"],
  Heavy: ["release", "purify", "reset", "begin"]
};

function hashSeed(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pickDeterministic<T>(arr: T[], seed: string, count: number): T[] {
  const h = hashSeed(seed);
  const step = (h % 7) + 3;
  let idx = h % arr.length;
  const result: T[] = [];
  const used = new Set<number>();
  while (result.length < count && used.size < arr.length) {
    if (!used.has(idx)) {
      used.add(idx);
      result.push(arr[idx]);
    }
    idx = (idx + step) % arr.length;
  }
  return result.slice(0, count);
}

function augmentByMood(list: string[], mood?: string, context?: string) {
  const verbs = mood ? moodVerbs[mood] || [] : [];
  if (verbs.length === 0) return list;
  const ctxWord =
    (context || "")
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter(Boolean)
      .find(w => w.length > 4) || "momentum";
  return list.map((s, i) => {
    const v = verbs[i % verbs.length];
    if (s.toLowerCase().startsWith("i ")) return s;
    return `I ${v} ${ctxWord} now`;
  });
}

export const generateAffirmations = async (mood?: string, context?: string): Promise<string[]> => {
  const seed = `${mood || ""}|${context || ""}`;
  const picks = pickDeterministic(baseAffirmations, seed, 11);
  const tuned = augmentByMood(picks, mood, context);
  return tuned;
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
