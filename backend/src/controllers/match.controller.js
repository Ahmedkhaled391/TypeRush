import { asyncHandler } from "../utils/asyncHandler.js";
import { Match } from "../models/Match.js";
import {
  createMatchSchema,
  joinMatchSchema,
  validateBody,
} from "../validators/match.validators.js";

function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function generateUniqueCode() {
  for (let i = 0; i < 10; i += 1) {
    const code = makeCode();
    const exists = await Match.exists({ code });
    if (!exists) return code;
  }
  throw new Error("Failed to generate unique match code");
}

export const createMatch = asyncHandler(async (req, res) => {
  const validated = validateBody(createMatchSchema, req.body);
  if (!validated.ok) {
    return res.status(400).json({ success: false, message: "Invalid payload", details: validated.errors });
  }

  const requestedCode = validated.data.code;
  const code = requestedCode || await generateUniqueCode();
  if (requestedCode && await Match.exists({ code: requestedCode })) {
    return res.status(409).json({ success: false, message: "Match code already exists" });
  }

  const userId = req.user._id;

  const match = await Match.create({
    code,
    lessonId: validated.data.lessonId,
    hostUserId: userId,
    status: "waiting",
    participants: [
      {
        userId,
        username: req.user.username,
      },
    ],
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
    return res.status(400).json({ success: false, message: "Invalid payload", details: validated.errors });
  }

  const { code, username } = validated.data;
  const userId = req.user._id;

  const match = await Match.findOne({ code: code.toUpperCase() });
  if (!match) {
    return res.status(404).json({ success: false, message: "Match not found" });
  }

  if (match.status !== "waiting") {
    return res.status(400).json({ success: false, message: "Match is not open for joining" });
  }

  const alreadyJoined = match.participants.some((p) => String(p.userId) === String(userId));
  if (!alreadyJoined && match.participants.length >= 2) {
    return res.status(400).json({ success: false, message: "Match is already full" });
  }

  if (!alreadyJoined) {
    match.participants.push({ userId, username });
    await match.save();
  }

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
  const code = String(req.params.code || "").toUpperCase();
  const match = await Match.findOne({ code }).select(
    "code lessonId status participants startedAt endedAt createdAt"
  );

  if (!match) {
    return res.status(404).json({ success: false, message: "Match not found" });
  }

  return res.status(200).json({
    success: true,
    data: match,
  });
});
