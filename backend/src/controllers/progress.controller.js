import { asyncHandler } from "../utils/asyncHandler.js";
import { attemptSchema } from "../validators/progress.validators.js";
import {
  getAggregateStatsForUser,
  getRecentAttemptsForUser,
  getUserProgressSummary,
  recordAttempt,
} from "../modules/progress/progress.service.js";
import { validateBody } from "../modules/shared/validation.js";

export const getUserProgress = asyncHandler(async (req, res) => {
  const summary = await getUserProgressSummary(req.user._id);

  res.status(200).json({
    success: true,
    data: summary,
  });
});

export const upsertAttempt = asyncHandler(async (req, res) => {
  const validated = validateBody(attemptSchema, req.body);
  if (!validated.ok) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Invalid payload",
        details: validated.errors,
      });
  }

  const result = await recordAttempt({
    userId: req.user._id,
    ...validated.data,
  });

  return res.status(201).json({
    success: true,
    data: result,
  });
});

export const getRecentAttempts = asyncHandler(async (req, res) => {
  const attempts = await getRecentAttemptsForUser(req.user._id);

  res.status(200).json({
    success: true,
    data: attempts,
  });
});

export const getAggregateStats = asyncHandler(async (req, res) => {
  const result = await getAggregateStatsForUser(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      attemptsCount: result.attemptsCount,
      avgWpm: Number((result.avgWpm || 0).toFixed(1)),
      avgAccuracy: Number((result.avgAccuracy || 0).toFixed(1)),
      bestWpm: result.bestWpm || 0,
      bestAccuracy: Number((result.bestAccuracy || 0).toFixed(1)),
      passedCount: result.passedCount,
    },
  });
});
