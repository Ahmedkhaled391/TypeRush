import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createMatchSchema,
  joinMatchSchema,
} from "../validators/match.validators.js";
import {
  createMatchForUser,
  getMatchByCodeRecord,
  joinMatchForUser,
} from "../modules/matches/match.service.js";
import { validateBody } from "../modules/shared/validation.js";

export const createMatch = asyncHandler(async (req, res) => {
  const validated = validateBody(createMatchSchema, req.body);
  if (!validated.ok) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Invalid payload",
        details: validated.errors,
      });
  }

  const match = await createMatchForUser({
    user: req.user,
    lessonId: validated.data.lessonId,
    requestedCode: validated.data.code,
  });

  return res.status(201).json({
    success: true,
    data: {
      code: match.code,
      lessonId: match.lessonId,
      status: match.status,
      participants: match.participants,
    },
  });
});

export const joinMatchByCode = asyncHandler(async (req, res) => {
  const validated = validateBody(joinMatchSchema, req.body);
  if (!validated.ok) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Invalid payload",
        details: validated.errors,
      });
  }

  const match = await joinMatchForUser({
    userId: req.user._id,
    username: validated.data.username,
    code: validated.data.code,
  });

  return res.status(200).json({
    success: true,
    data: {
      code: match.code,
      lessonId: match.lessonId,
      status: match.status,
      participants: match.participants,
    },
  });
});

export const getMatchByCode = asyncHandler(async (req, res) => {
  const match = await getMatchByCodeRecord(req.params.code);

  if (!match) {
    return res.status(404).json({ success: false, message: "Match not found" });
  }

  return res.status(200).json({
    success: true,
    data: match,
  });
});
