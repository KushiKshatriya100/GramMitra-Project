import { SKILLS, Skill } from "./skills";

// Common synonyms / colloquial terms → canonical skill from SKILLS.
// Lowercased keys are matched against the user's query.
const ALIASES: Record<string, Skill> = {
  // Electrical
  electric: "electrical wiring",
  electrician: "electrical wiring",
  electrical: "electrical wiring",
  wiring: "electrical wiring",

  // Plumbing
  plumber: "plumbing",
  plumb: "plumbing",
  pipe: "plumbing",
  leak: "leakage fixing",
  leakage: "leakage fixing",
  tank: "water tank cleaning",

  // Appliances
  ac: "ac repair",
  "air conditioner": "ac repair",
  fridge: "refrigerator repair",
  refrigerator: "refrigerator repair",
  refrigeration: "refrigerator repair",
  washingmachine: "washing machine repair",
  washing: "washing machine repair",
  microwave: "microwave repair",
  oven: "microwave repair",
  geyser: "geyser repair",
  heater: "geyser repair",
  ro: "water purifier repair",
  purifier: "water purifier repair",
  chimney: "chimney repair",

  // Electronics
  television: "tv repair",
  tv: "tv repair",
  mobile: "mobile repair",
  phone: "mobile repair",
  smartphone: "mobile repair",
  laptop: "laptop repair",
  pc: "laptop repair",
  inverter: "inverter repair",
  battery: "inverter repair",
  ups: "inverter repair",

  // Cleaning
  cleaner: "house cleaning",
  cleaning: "house cleaning",
  sweeper: "house cleaning",
  housekeeping: "house cleaning",
  sofa: "sofa cleaning",
  kitchen: "kitchen cleaning",
  bathroom: "bathroom cleaning",
  washroom: "bathroom cleaning",
  toilet: "bathroom cleaning",

  // Personal
  maid: "maid",
  helper: "maid",
  cook: "cook",
  chef: "cook",
  nanny: "babysitter",
  babysitter: "babysitter",
  child: "babysitter",
  elder: "elder care",
  old: "elder care",
  senior: "elder care",
  barber: "haircut",
  salon: "haircut",
  beauty: "beautician",
  beautician: "beautician",
  makeup: "beautician",
  parlor: "beautician",

  // Education
  tutor: "tuition",
  teacher: "tuition",
  tuition: "tuition",
  math: "math tutor",
  maths: "math tutor",
  mathematics: "math tutor",
  english: "english tutor",
  computer: "computer training",
  coding: "computer training",

  // Construction
  carpenter: "carpenter",
  wood: "carpenter",
  furniture: "carpenter",
  painter: "painter",
  paint: "painter",
  mason: "mason",
  raj: "mason",
  interior: "interior repair",

  // Rural
  tractor: "tractor repair",
  solar: "solar panel",
  panel: "solar panel",
  pump: "motor pump repair",
  motor: "motor pump repair",
  agriculture: "agriculture pump",
  farming: "agriculture pump",
  fence: "fencing",
  fencing: "fencing",
};

/**
 * Token-aware fuzzy skill search.
 *
 * Scoring (higher = better):
 *   1000 exact match on canonical skill name
 *    900 exact alias hit
 *    800 skill starts with the query
 *    600 skill contains the query as a substring
 *    400 alias key starts with the query
 *    200 every query token appears as a word in the skill
 *     ⨯  short skill names get a small bonus (shorter = more specific)
 *
 * Returns ranked canonical skills, deduped, best first. Limit defaults to 8.
 */
export interface SkillMatch {
  skill: Skill;
  score: number;
}

const normalize = (s: string) =>
  s.toLowerCase().trim().replace(/-/g, " ").replace(/\s+/g, " ");

const tokenize = (s: string) => normalize(s).split(" ").filter(Boolean);

export const searchSkills = (
  rawQuery: string,
  limit = 8
): SkillMatch[] => {
  const query = normalize(rawQuery);
  if (!query) return [];

  const queryTokens = tokenize(query);
  const matches = new Map<Skill, number>();

  const consider = (skill: Skill, score: number) => {
    const current = matches.get(skill) ?? 0;
    if (score > current) matches.set(skill, score);
  };

  // 1. Alias hits — exact and prefix
  for (const [alias, target] of Object.entries(ALIASES)) {
    const aliasNorm = normalize(alias);
    if (aliasNorm === query) consider(target, 900);
    else if (aliasNorm.startsWith(query)) consider(target, 400);
    else if (query.startsWith(aliasNorm)) consider(target, 350);
  }

  // 2. Direct skill scoring
  for (const skill of SKILLS) {
    const s = skill as string;

    if (s === query) consider(skill, 1000);
    else if (s.startsWith(query)) consider(skill, 800);
    else if (s.includes(query)) consider(skill, 600);
    else {
      // Token match: every query token must appear as a whole word in skill
      const skillTokens = tokenize(s);
      const allTokensHit = queryTokens.every((qt) =>
        skillTokens.some((st) => st.startsWith(qt))
      );
      if (allTokensHit) consider(skill, 200);
    }
  }

  return Array.from(matches.entries())
    .map(([skill, score]) => ({
      skill,
      // Bonus: shorter skill names rank slightly higher (tie-breaker)
      score: score - skill.length * 0.5,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

/** Convenience: best single skill match, or null. */
export const bestSkillMatch = (rawQuery: string): Skill | null => {
  const [top] = searchSkills(rawQuery, 1);
  return top?.skill ?? null;
};

/**
 * Defensive check used on the results page — does this worker actually
 * provide the requested skill? Tolerates spacing/hyphen variants.
 */
export const workerHasSkill = (
  workerSkills: string[] | undefined,
  targetSkill: string
): boolean => {
  if (!workerSkills?.length || !targetSkill) return false;
  const target = normalize(targetSkill);
  return workerSkills.some((s) => normalize(s) === target);
};
