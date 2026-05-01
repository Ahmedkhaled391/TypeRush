import { asyncHandler } from "../utils/asyncHandler.js";
import { Attempt } from "../models/Attempt.js";
import { calculateStars } from "../utils/lessonScoring.js";
import { attemptSchema, validateBody } from "../validators/progress.validators.js";

export const getUserProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;

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

  res.status(200).json({
    success: true,
    data: {
      unlockedUpTo: Math.min(unlockedUpTo, 100),
      lessons: perLessonBest,
    },
  });
});

export const upsertAttempt = asyncHandler(async (req, res) => {
  const validated = validateBody(attemptSchema, req.body);
  if (!validated.ok) {
    return res.status(400).json({ success: false, message: "Invalid payload", details: validated.errors });
  }

  const userId = req.user._id;
  const {
    lessonId,
    wpm,
    accuracy,
    elapsedMs,
    wpmRequirement,
    accuracyRequirement,
  } = validated.data;

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

  return res.status(201).json({
    success: true,
    data: {
      attemptId: attempt._id,
      passed,
      stars,
    },
  });
});

export const getRecentAttempts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const attempts = await Attempt.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("lessonId wpm accuracy elapsedMs stars passed createdAt");

  res.status(200).json({
    success: true,
    data: attempts,
  });
});

export const getAggregateStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
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

  const safe = result || {
    attemptsCount: 0,
    avgWpm: 0,
    avgAccuracy: 0,
    bestWpm: 0,
    bestAccuracy: 0,
    passedCount: 0,
  };

  res.status(200).json({
    success: true,
    data: {
      attemptsCount: safe.attemptsCount,
      avgWpm: Number((safe.avgWpm || 0).toFixed(1)),
      avgAccuracy: Number((safe.avgAccuracy || 0).toFixed(1)),
      bestWpm: safe.bestWpm || 0,
      bestAccuracy: Number((safe.bestAccuracy || 0).toFixed(1)),
      passedCount: safe.passedCount,
    },
  });
});
