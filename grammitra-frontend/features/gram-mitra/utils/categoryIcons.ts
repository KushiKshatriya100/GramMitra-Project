import { Skill } from "./skills";

// 🔥 DEFAULT ICON (fallback safe)
export const DEFAULT_ICON = "🔧";

// 🔥 TYPE-SAFE ICON MAP
export const categoryIcons: Partial<Record<Skill, string>> = {
  // appliances
  "ac repair": "❄️",
  "refrigerator repair": "🧊",
  "washing machine repair": "🌀",
  "microwave repair": "🔥",
  "geyser repair": "🚿",
  "water purifier repair": "💧",
  "chimney repair": "🏡",

  // electronics
  "tv repair": "📺",
  "mobile repair": "📱",
  "laptop repair": "💻",
  "electrical wiring": "⚡",
  "inverter repair": "🔋",

  // plumbing
  "plumbing": "🔧",
  "water tank cleaning": "🚰",
  "leakage fixing": "💦",
  "motor pump repair": "⚙️",

  // cleaning
  "house cleaning": "🧹",
  "deep cleaning": "🧽",
  "kitchen cleaning": "🍳",
  "bathroom cleaning": "🚿",
  "sofa cleaning": "🛋️",

  // personal
  "maid": "🧕",
  "cook": "👨‍🍳",
  "babysitter": "👶",
  "elder care": "👴",
  "beautician": "💄",
  "haircut": "✂️",

  // education
  "tuition": "📚",
  "math tutor": "➗",
  "english tutor": "🔤",
  "computer training": "🖥️",

  // construction
  "carpenter": "🪚",
  "painter": "🎨",
  "mason": "🧱",
  "interior repair": "🏠",

  // rural
  "tractor repair": "🚜",
  "solar panel": "☀️",
  "agriculture pump": "💦",
  "fencing": "🚧",
};

// 🔥 SAFE ICON GETTER (NO CRASH)
export const getCategoryIcon = (skill?: string): string => {
  if (!skill) return DEFAULT_ICON;

  return (
    categoryIcons[skill.toLowerCase() as Skill] || DEFAULT_ICON
  );
};