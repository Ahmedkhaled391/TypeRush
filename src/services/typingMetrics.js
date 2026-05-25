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

const EMPTY_TYPING_STATE = {
  typedText: "",
  currentCharIndex: 0,
  currentWordIndex: 0,
  wpm: 0,
  accuracy: 100,
  progress: 0,
  pressedKey: null,
  isReady: false,
  isFinished: false,
  finishedAt: null,
  mistakeIndexes: [],
  totalMistakes: 0,
};

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function clamp(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}

export function createInitialTypingState(overrides = {}) {
  return {
    ...EMPTY_TYPING_STATE,
    ...overrides,
    mistakeIndexes: toSafeArray(overrides.mistakeIndexes),
    totalMistakes: Math.max(0, Number(overrides.totalMistakes || 0)),
  };
}

export function calculateCurrentCharIndex(typedText = "") {
  return typedText.length;
}

export function calculateCurrentWordIndex(lessonText = "", currentCharIndex = 0) {
  if (!lessonText || currentCharIndex <= 0) return 0;

  const beforeCursor = lessonText.slice(0, currentCharIndex);
  const completedWords = beforeCursor.match(/\S+/g) || [];
  const nextWordOffset = /\s$/.test(beforeCursor) ? 0 : -1;
  const currentWordIndex = completedWords.length + nextWordOffset;
  const wordCount = (lessonText.match(/\S+/g) || []).length;

  return clamp(currentWordIndex, 0, Math.max(0, wordCount - 1));
}

export function countCorrectChars(typedText = "", lessonText = "") {
  let correct = 0;
  for (let i = 0; i < typedText.length; i += 1) {
    if (typedText[i] === lessonText[i]) correct += 1;
  }
  return correct;
}

export function getCharStatus(index, typedText = "", lessonText = "", mistakeIndexes = []) {
  if (index >= typedText.length) return "neutral";
  if (typedText[index] === lessonText[index]) {
    return mistakeIndexes.includes(index) ? "corrected" : "correct";
  }
  return "wrong";
}

export function calculateTypingStats({
  lessonText = "",
  typedText = "",
  totalMistakes = 0,
  elapsedMs = 0,
} = {}) {
  const currentCharIndex = calculateCurrentCharIndex(typedText);
  return {
    currentCharIndex,
    currentWordIndex: calculateCurrentWordIndex(lessonText, currentCharIndex),
    wpm: calculateWpm(countCorrectChars(typedText, lessonText), elapsedMs),
    accuracy: calculateAccuracy(typedText.length, totalMistakes),
    progress: calculateProgress(typedText.length, lessonText.length),
  };
}

export function updateTypingStateMetrics(
  typingState = EMPTY_TYPING_STATE,
  lessonText = "",
  elapsedMs = 0,
  overrides = {}
) {
  const typedText = String(typingState.typedText || "");
  const totalMistakes = Math.max(0, Number(typingState.totalMistakes || 0));

  return createInitialTypingState({
    ...typingState,
    ...calculateTypingStats({
      lessonText,
      typedText,
      totalMistakes,
      elapsedMs,
    }),
    ...overrides,
    typedText,
    totalMistakes,
  });
}

export function applyTypingKeyToState({
  typingState = EMPTY_TYPING_STATE,
  lessonText = "",
  key,
  elapsedMs = 0,
  now = Date.now(),
} = {}) {
  if (!lessonText || !key || typingState.isFinished) {
    return typingState;
  }

  if (key === "Backspace") {
    return updateTypingStateMetrics(
      {
        ...typingState,
        typedText: String(typingState.typedText || "").slice(0, -1),
      },
      lessonText,
      elapsedMs,
      { pressedKey: key }
    );
  }

  if (key.length !== 1 || String(typingState.typedText || "").length >= lessonText.length) {
    return typingState;
  }

  const typedText = String(typingState.typedText || "");
  const position = typedText.length;
  const mistakeIndexes = new Set(toSafeArray(typingState.mistakeIndexes));
  const isMistake = key !== lessonText[position];

  if (isMistake) {
    mistakeIndexes.add(position);
  }

  const nextTypedText = typedText + key;
  const isFinished = nextTypedText.length >= lessonText.length;

  return updateTypingStateMetrics(
    {
      ...typingState,
      typedText: nextTypedText,
      mistakeIndexes: [...mistakeIndexes],
      totalMistakes: Math.max(0, Number(typingState.totalMistakes || 0)) + (isMistake ? 1 : 0),
    },
    lessonText,
    elapsedMs,
    {
      pressedKey: key,
      isFinished,
      finishedAt: isFinished ? now : null,
    }
  );
}

export function toPublicTypingState(typingState = EMPTY_TYPING_STATE) {
  const safeState = createInitialTypingState(typingState);
  return {
    typedText: safeState.typedText,
    currentCharIndex: safeState.currentCharIndex,
    currentWordIndex: safeState.currentWordIndex,
    wpm: safeState.wpm,
    accuracy: safeState.accuracy,
    progress: safeState.progress,
    pressedKey: safeState.pressedKey,
    isReady: safeState.isReady,
    isFinished: safeState.isFinished,
    finishedAt: safeState.finishedAt,
    mistakeIndexes: safeState.mistakeIndexes,
    totalMistakes: safeState.totalMistakes,
  };
}
