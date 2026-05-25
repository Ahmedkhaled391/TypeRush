export const MULTIPLAYER_WIN_POINTS = 25;
export const MULTIPLAYER_POINTS_PER_LEVEL = 100;
export const MAX_MULTIPLAYER_LEVEL = 50;
export const MAX_MULTIPLAYER_POINTS =
  MAX_MULTIPLAYER_LEVEL * MULTIPLAYER_POINTS_PER_LEVEL;

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function clampMultiplayerPoints(points = 0) {
  return Math.min(
    MAX_MULTIPLAYER_POINTS,
    Math.max(0, Math.floor(toFiniteNumber(points))),
  );
}

export function getMultiplayerLevel(points = 0) {
  return Math.min(
    MAX_MULTIPLAYER_LEVEL,
    Math.floor(clampMultiplayerPoints(points) / MULTIPLAYER_POINTS_PER_LEVEL),
  );
}

export function buildMultiplayerLevelProgress(source = {}) {
  const progressSource = source?.levelProgress || source || {};
  const points = clampMultiplayerPoints(progressSource.points);
  const level = getMultiplayerLevel(points);
  const isMaxLevel = level >= MAX_MULTIPLAYER_LEVEL;
  const pointsInLevel = isMaxLevel
    ? MULTIPLAYER_POINTS_PER_LEVEL
    : points - level * MULTIPLAYER_POINTS_PER_LEVEL;
  const pointsToNextLevel = isMaxLevel
    ? 0
    : MULTIPLAYER_POINTS_PER_LEVEL - pointsInLevel;
  const progressPercent = isMaxLevel
    ? 100
    : Math.round((pointsInLevel / MULTIPLAYER_POINTS_PER_LEVEL) * 100);

  return {
    level,
    points,
    maxLevel: MAX_MULTIPLAYER_LEVEL,
    pointsPerLevel: MULTIPLAYER_POINTS_PER_LEVEL,
    pointsInLevel,
    pointsToNextLevel,
    progressPercent,
    isMaxLevel,
  };
}

export function getMultiplayerLevelTitle(level = 0) {
  if (level >= MAX_MULTIPLAYER_LEVEL) return "Max Level";
  if (level >= 40) return "Pro Level";
  if (level >= 25) return "Elite Level";
  if (level >= 10) return "Rising Level";
  return "Starter Level";
}
