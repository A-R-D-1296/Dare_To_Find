export const urgencyKeywords = [
  "suicide",
  "kill myself",
  "end my life",
  "threat",
  "violence",
  "kidnap",
  "abuse",
  "emergency",
  "murder",
  "rape",
  "assault",
  "beating",
  "domestic violence",
  "help me now",
  "life in danger",
  "gun",
  "weapon"
];

export const checkUrgency = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return urgencyKeywords.some(keyword => lowerText.includes(keyword));
};
