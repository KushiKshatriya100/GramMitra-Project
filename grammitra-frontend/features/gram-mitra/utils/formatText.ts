export const formatSkillName = (text: string) => {
  if (!text) return text;

  // Handle special cases like AC
  const words = text.split(" ");

  return words
    .map((word) => {
      if (word.toLowerCase() === "ac") return "AC";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};