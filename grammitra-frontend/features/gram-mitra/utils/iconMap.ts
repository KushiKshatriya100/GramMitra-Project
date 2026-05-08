import { Skill } from "./skills";

// 🔥 DEFAULT ICON (fallback)
export const DEFAULT_ICON_URL =
  "https://img.icons8.com/ios-filled/50/service.png";

// 🔥 TYPE-SAFE ICON MAP
const iconMap: Partial<Record<Skill, string>> = {
  electrician: "https://img.icons8.com/color/96/electrical.png",
  plumber: "https://img.icons8.com/color/96/plumber.png",
  carpenter: "https://img.icons8.com/color/96/carpenter.png",
  housekeeping: "https://img.icons8.com/color/96/cleaning.png",
  salon: "https://img.icons8.com/color/96/hair-dryer.png",
  babysitter: "https://img.icons8.com/color/96/baby.png",
  tuition: "https://img.icons8.com/color/96/classroom.png",
  grocery: "https://img.icons8.com/color/96/shopping-cart.png",
  "ac repair": "https://img.icons8.com/color/96/air-conditioner.png",
  painter: "https://img.icons8.com/color/96/paint-roller.png",
};

// 🔥 SAFE ICON GETTER
export const getIcon = (skill?: string): string => {
  if (!skill) return DEFAULT_ICON_URL;

  const normalized = skill.toLowerCase().trim() as Skill;

  return iconMap[normalized] || DEFAULT_ICON_URL;
};