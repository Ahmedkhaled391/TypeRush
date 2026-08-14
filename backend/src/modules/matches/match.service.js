import { Match } from "../../models/Match.js";

export function makeMatchCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function generateUniqueCode() {
  for (let i = 0; i < 10; i += 1) {
    const code = makeMatchCode();
    const exists = await Match.exists({ code });
    if (!exists) return code;
  }

  throw new Error("Failed to generate unique match code");
}

export function createMatchRecord({ hostUserId, lessonId, code, username }) {
  return {
    code,
    lessonId,
    status: "waiting",
    participants: [
      {
        userId: hostUserId,
        username,
      },
    ],
  };
}

export async function createMatchForUser({ user, lessonId, requestedCode }) {
  const code = requestedCode || (await generateUniqueCode());

  if (requestedCode && (await Match.exists({ code: requestedCode }))) {
    const error = new Error("Match code already exists");
    error.statusCode = 409;
    throw error;
  }

  const match = await Match.create({
    ...createMatchRecord({
      hostUserId: user._id,
      lessonId,
      code,
      username: user.username,
    }),
  });

  return match;
}

export async function joinMatchForUser({ userId, username, code }) {
  const match = await Match.findOne({ code: code.toUpperCase() });
  if (!match) {
    const error = new Error("Match not found");
    error.statusCode = 404;
    throw error;
  }

  if (match.status !== "waiting") {
    const error = new Error("Match is not open for joining");
    error.statusCode = 400;
    throw error;
  }

  const alreadyJoined = match.participants.some(
    (participant) => String(participant.userId) === String(userId),
  );

  if (!alreadyJoined && match.participants.length >= 2) {
    const error = new Error("Match is already full");
    error.statusCode = 400;
    throw error;
  }

  if (!alreadyJoined) {
    match.participants.push({ userId, username });
    await match.save();
  }

  return match;
}

export async function getMatchByCodeRecord(code) {
  return Match.findOne({ code: String(code || "").toUpperCase() }).select(
    "code lessonId status participants startedAt endedAt createdAt",
  );
}
