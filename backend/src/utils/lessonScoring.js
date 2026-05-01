export function calculateStars({ wpm, accuracy, wpmRequirement, accuracyRequirement }) {
  if (wpm < wpmRequirement || accuracy < accuracyRequirement) {
    return 0;
  }

  const wpmRatio = wpm / wpmRequirement;
  const accRatio = accuracy / accuracyRequirement;
  const avg = (wpmRatio + accRatio) / 2;

  if (avg >= 1.4) return 3;
  if (avg >= 1.2) return 2;
  return 1;
}
