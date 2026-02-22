export const domainKeywords = {
  career: ["job", "interview", "career", "promotion", "work", "boss", "hired", "fired", "office", "resume"],
  money: ["money", "earn", "income", "broke", "rich", "salary", "debt", "bills", "paycheck", "wealth"],
  love: ["love", "relationship", "partner", "marriage", "alone", "dating", "breakup", "rejected", "romantic"],
  family: ["family", "parents", "home", "children", "kids", "mother", "father", "sibling"],
  health: ["health", "sick", "body", "ill", "tired", "pain", "injury", "weight", "sleep"],
  mindset: ["confidence", "worthy", "capable", "failure", "smart", "enough", "stupid", "weak", "insecure"]
} as const;

export type ReframeDomain = keyof typeof domainKeywords;

export function detectNegativePattern(input: string): string {
  const s = input.toLowerCase().trim();
  if (!s) return "none";
  if (s.includes("i will never")) return "never";
  if (s.includes("i always")) return "always";
  if (s.includes("i can't") || s.includes("i cannot")) return "cant";
  if (s.includes("i am not") || s.includes("i'm not")) return "not_enough";
  if (s.includes("nothing ever")) return "nothing_ever";
  if (s.includes("everyone thinks")) return "everyone_thinks";
  if (s.includes("i fail") || s.includes("i always fail")) return "fail";
  if (s.includes("i don't deserve") || s.includes("i do not deserve")) return "undeserving";
  return "generic";
}

export const reframingTemplates: Record<ReframeDomain, string[]> = {
  money: [
    "I am learning to create new pathways for financial growth.",
    "My financial story is evolving with every conscious decision I make.",
    "I am building skills and awareness that increase my income steadily.",
    "I am becoming someone who makes clear, empowered money choices.",
    "I am opening to new streams of value and compensation.",
    "I am learning to see money as a tool I can master.",
    "I am allowing opportunities for fair and abundant pay to find me.",
    "I am becoming more resourceful and creative with how I earn.",
    "I am building a stable financial foundation one step at a time.",
    "I am learning to ask for and receive what my work is worth.",
    "I am rewriting my beliefs about what is possible for my income.",
    "I am learning to trust that I can generate value and be rewarded.",
    "I am increasingly supported by the value I provide.",
    "I am growing into someone who feels safe with money."
  ],
  love: [
    "I am becoming emotionally available and open to healthy connection.",
    "I am worthy of love that feels safe and aligned.",
    "I am learning to choose relationships that reflect my growth.",
    "I am becoming someone who communicates needs with clarity and warmth.",
    "I am learning to receive love without shrinking or overgiving.",
    "I am opening to relationships where I feel seen and respected.",
    "I am learning from every past connection and choosing better each time.",
    "I am cultivating a loving relationship with myself first.",
    "I am making space for people who genuinely value me.",
    "I am worthy of steady, reciprocal love.",
    "I am becoming someone who sets and honors healthy relational boundaries.",
    "I am open to love that supports my evolution, not my fears.",
    "I am learning to recognize and walk toward emotionally safe people.",
    "I am learning to trust that I do not have to chase love."
  ],
  career: [
    "Every experience is sharpening my professional direction.",
    "I am building competence through consistent effort.",
    "I am learning how to position myself for aligned opportunities.",
    "I am becoming someone who brings clear value to my work.",
    "I am learning to speak about my skills with grounded confidence.",
    "I am treating each interview and project as practice, not a verdict.",
    "I am allowed to grow into roles that once felt out of reach.",
    "I am building a career that reflects my strengths and values.",
    "I am learning to advocate for my worth in professional spaces.",
    "I am becoming more resilient and adaptable in my work life.",
    "I am open to roles that fit me better than what I have known before.",
    "I am learning from feedback and using it to refine my path.",
    "I am building a body of work I can feel proud of.",
    "I am allowed to change direction as I gain clarity."
  ],
  health: [
    "My body is capable of gradual healing and renewal.",
    "I am becoming more attentive to what supports my wellbeing.",
    "I am making small changes that strengthen my health daily.",
    "I am learning to listen to my body with patience and respect.",
    "I am allowed to rest without guilt as I rebuild my energy.",
    "I am choosing habits that gently support my long-term health.",
    "I am learning to respond to my body with compassion, not criticism.",
    "I am open to new ways of caring for my physical and emotional health.",
    "I am becoming someone who prioritizes sustainable wellbeing.",
    "I am taking steps, however small, toward feeling more vibrant.",
    "I am learning to trust my body’s ability to adapt and heal.",
    "I am releasing all-or-nothing thinking around my health changes.",
    "I am allowed to improve at my own pace without pressure.",
    "I am building a relationship with my body based on partnership."
  ],
  family: [
    "I am learning healthier ways to communicate and connect.",
    "Growth within me influences my environment positively.",
    "I am capable of rewriting relational patterns.",
    "I am learning to set boundaries that honor everyone’s humanity.",
    "I am becoming someone who responds instead of reacts.",
    "I am allowed to create emotional safety for myself within family dynamics.",
    "I am learning to release roles that no longer serve me.",
    "I am open to new ways of relating that feel more respectful and kind.",
    "I am learning to see my family members as humans on their own journeys.",
    "I am allowed to build chosen family alongside biological family.",
    "I am becoming someone who breaks unhelpful generational patterns.",
    "I am learning to hold compassion without abandoning myself.",
    "I am gradually changing how I show up in family conversations.",
    "I am building a sense of home that starts within me."
  ],
  mindset: [
    "I am expanding my sense of capability each day.",
    "I am capable of learning what I do not yet know.",
    "My confidence grows through aligned action.",
    "I am learning to speak to myself with encouragement instead of contempt.",
    "I am becoming someone who notices progress more than perceived flaws.",
    "I am learning to see mistakes as information, not evidence against me.",
    "I am building trust in myself by following through on small promises.",
    "I am allowed to be a work in progress and still worthy.",
    "I am learning to question stories that say I am not enough.",
    "I am becoming someone who expects growth instead of perfection.",
    "I am learning to anchor my worth in who I am, not what I produce.",
    "I am capable of outgrowing old labels and limitations.",
    "I am training my mind to look for possibility.",
    "I am increasingly kind to myself as I evolve."
  ]
};

