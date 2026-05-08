// 🔥 MASTER SKILL LIST (SOURCE OF TRUTH)
export const SKILLS = [
  // Home Appliance
  "ac repair",
  "refrigerator repair",
  "washing machine repair",
  "microwave repair",
  "geyser repair",
  "water purifier repair",
  "chimney repair",

  // Electronics
  "tv repair",
  "mobile repair",
  "laptop repair",
  "electrical wiring",
  "inverter repair",

  // Plumbing
  "plumbing",
  "water tank cleaning",
  "leakage fixing",
  "motor pump repair",

  // Cleaning
  "house cleaning",
  "deep cleaning",
  "kitchen cleaning",
  "bathroom cleaning",
  "sofa cleaning",

  // Personal
  "maid",
  "cook",
  "babysitter",
  "elder care",
  "beautician",
  "haircut",

  // Education
  "tuition",
  "math tutor",
  "english tutor",
  "computer training",

  // Construction
  "carpenter",
  "painter",
  "mason",
  "interior repair",

  // Rural
  "tractor repair",
  "solar panel",
  "agriculture pump",
  "fencing",
] as const;

// 🔥 TYPE (STRICT)
export type Skill = (typeof SKILLS)[number];

// 🔥 NORMALIZER (VERY IMPORTANT)
export const normalizeSkill = (skill?: string): Skill | null => {
  if (!skill) return null;

  const normalized = skill.toLowerCase().trim();

  return SKILLS.includes(normalized as Skill)
    ? (normalized as Skill)
    : null;
};

// 🔥 VALIDATION HELPER
export const isValidSkill = (skill?: string): boolean => {
  return !!normalizeSkill(skill);
};