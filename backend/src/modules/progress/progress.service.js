import { Attempt } from "../../models/Attempt.js";
import { calculateStars } from "../../utils/lessonScoring.js";

export async function getUserProgressSummary(userId) {
  const perLessonBest = await Attempt.aggregate([
    { $match: { userId } },
    { $sort: { lessonId: 1, stars: -1, createdAt: -1 } },
    {
      $group: {
        _id: "$lessonId",
        lessonId: { $first: "$lessonId" },
        bestStars: { $first: "$stars" },
        bestWpm: { $max: "$wpm" },
        bestAccuracy: { $max: "$accuracy" },
        passed: { $max: "$passed" },
      },
    },
    { $sort: { lessonId: 1 } },
  ]);

  const passedLessons = perLessonBest
    .filter((item) => Boolean(item.passed))
    .map((item) => item.lessonId)
    .sort((a, b) => a - b);

  let unlockedUpTo = 1;
  for (let i = 1; i <= 100; i += 1) {
    if (passedLessons.includes(i)) {
      unlockedUpTo = i + 1;
    } else {
      break;
    }
  }

  return {
    unlockedUpTo: Math.min(unlockedUpTo, 100),
    lessons: perLessonBest,
  };
}

export async function recordAttempt({
  userId,
  lessonId,
  wpm,
  accuracy,
  elapsedMs,
  wpmRequirement,
  accuracyRequirement,
}) {
  const stars = calculateStars({
    wpm,
    accuracy,
    wpmRequirement,
    accuracyRequirement,
  });
  const passed = stars > 0;

  const attempt = await Attempt.create({
    userId,
    lessonId,
    wpm,
    accuracy,
    elapsedMs,
    stars,
    passed,
  });

  return {
    attemptId: attempt._id,
    passed,
    stars,
  };
}

export async function getRecentAttemptsForUser(userId) {
  return Attempt.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("lessonId wpm accuracy elapsedMs stars passed createdAt");
}

export async function getAggregateStatsForUser(userId) {
  const [result] = await Attempt.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        attemptsCount: { $sum: 1 },
        avgWpm: { $avg: "$wpm" },
        avgAccuracy: { $avg: "$accuracy" },
        bestWpm: { $max: "$wpm" },
        bestAccuracy: { $max: "$accuracy" },
        passedCount: {
          $sum: {
            $cond: [{ $eq: ["$passed", true] }, 1, 0],
          },
        },
      },
    },
  ]);

  return (
    result || {
      attemptsCount: 0,
      avgWpm: 0,
      avgAccuracy: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      passedCount: 0,
    }
  );
}
