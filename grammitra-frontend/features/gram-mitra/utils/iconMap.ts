const iconMap: Record<string, string> = {
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

export const getIcon = (skill: string) => {
  return (
    iconMap[skill.toLowerCase()] ||
    "https://img.icons8.com/ios-filled/50/service.png"
  );
};