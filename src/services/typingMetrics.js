export function calculateWpm(correctChars, elapsedMs) {
  if (elapsedMs <= 0) return 0;
  const wordsTyped = correctChars / 5;
  const minutes = elapsedMs / 60000;
  return Number((wordsTyped / minutes).toFixed(1));
}

export function calculateAccuracy(totalTyped, totalMistakes) {
  if (totalTyped <= 0) return 100;
  const correctKeystrokes = Math.max(0, totalTyped - totalMistakes);
  return Number(((correctKeystrokes / totalTyped) * 100).toFixed(1));
}

export function calculateProgress(typedLength, lessonLength) {
  if (lessonLength <= 0) return 0;
  const raw = (typedLength / lessonLength) * 100;
  return Math.min(100, Number(raw.toFixed(1)));
}
