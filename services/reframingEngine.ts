import { domainKeywords, ReframeDomain } from "./reframingLibrary";

export type NegativePattern =
  | "self_doubt"
  | "permanence"
  | "scarcity"
  | "failure_identity"
  | "comparison"
  | "unknown";

export type ReframeResult = {
  reframed: string;
  domain: ReframeDomain;
  pattern: NegativePattern;
  confidence: number;
};

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter(Boolean);
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
    if (domainKeywords[key].some(word => lowered.includes(word))) {
      return key;
    }
  }
  return "mindset";
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

let lastOutputs: string[] = [];

export function reframeBelief(input: string): ReframeResult {
  const subject = extractSubject(input);
  const pattern = detectPattern(input);
  const domain = detectDomain(input);

  let reframed = buildReframe(subject, pattern, domain);
  let attempts = 0;
  while (lastOutputs.includes(reframed) && attempts < 10) {
    reframed = buildReframe(subject, pattern, domain);
    attempts += 1;
  }

  lastOutputs = [...lastOutputs, reframed].slice(-5);

  const confidence = calculateConfidence(subject, pattern, domain);

  return { reframed, domain, pattern, confidence };
}

