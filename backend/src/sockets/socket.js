import { Match } from "../models/Match.js";
import { User } from "../models/User.js";
import {
  MULTIPLAYER_WIN_POINTS,
  clampMultiplayerPoints,
  getMultiplayerLevel,
  getMultiplayerLevelProgress,
} from "../utils/multiplayerLevel.js";

const activeMatches = new Map();
const socketMatches = new Map();

const MATCH_CODE_LENGTH = 6;
const MAX_LESSON_ID = 100;
const MAX_TYPED_TEXT_LENGTH = 5000;
const MAX_MISTAKE_INDEXES = 5000;
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

function roomName(matchCode) {
  return `match:${matchCode}`;
}

function emitMatchError(socket, message) {
  socket.emit("matchError", { message });
}

function normalizeMatchCode(matchCode) {
  return String(matchCode || "")
    .trim()
    .toUpperCase();
}

function clampNumber(value, min, max, fallback = min) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function isValidObjectId(value) {
  return OBJECT_ID_PATTERN.test(String(value || ""));
}

function createTypingState(overrides = {}) {
  return {
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
    ...overrides,
  };
}

function sanitizeUser(user = {}) {
  const username = String(user.username || "Player")
    .trim()
    .slice(0, 32);
  const userId = String(user.userId || "")
    .trim()
    .slice(0, 96);

  return {
    userId,
    username: username.length >= 2 ? username : "Player",
  };
}

function sanitizeTypingState(typingState = {}) {
  const typedText = String(typingState.typedText || "").slice(
    0,
    MAX_TYPED_TEXT_LENGTH,
  );
  const currentCharIndex = clampNumber(
    typingState.currentCharIndex,
    0,
    MAX_TYPED_TEXT_LENGTH,
    typedText.length,
  );
  const currentWordIndex = clampNumber(
    typingState.currentWordIndex,
    0,
    MAX_TYPED_TEXT_LENGTH,
    0,
  );
  const mistakeIndexes = Array.isArray(typingState.mistakeIndexes)
    ? [...new Set(typingState.mistakeIndexes)]
        .map((index) => Number(index))
        .filter(
          (index) =>
            Number.isInteger(index) &&
            index >= 0 &&
            index < MAX_TYPED_TEXT_LENGTH,
        )
        .slice(0, MAX_MISTAKE_INDEXES)
    : [];

  const pressedKey =
    typeof typingState.pressedKey === "string"
      ? typingState.pressedKey.slice(0, 24)
      : null;

  return createTypingState({
    typedText,
    currentCharIndex,
    currentWordIndex,
    wpm: clampNumber(typingState.wpm, 0, 1000, 0),
    accuracy: clampNumber(typingState.accuracy, 0, 100, 100),
    progress: clampNumber(typingState.progress, 0, 100, 0),
    pressedKey,
    isReady: Boolean(typingState.isReady),
    isFinished: Boolean(typingState.isFinished),
    finishedAt: typingState.finishedAt || null,
    mistakeIndexes,
    totalMistakes: clampNumber(typingState.totalMistakes, 0, 10000, 0),
  });
}

function publicPlayer(player) {
  return {
    playerId: player.socketId,
    userId: player.userId,
    username: player.username,
    levelProgress: player.levelProgress || null,
    typingState: player.typingState,
    isReady: player.isReady,
    isFinished: player.isFinished,
    result: player.result,
  };
}

function publicResult(player) {
  return {
    playerId: player.socketId,
    userId: player.userId,
    username: player.username,
    levelProgress: player.levelProgress || null,
    result: player.result,
  };
}

function publicMatchState(match, playerId) {
  return {
    code: match.code,
    lessonId: match.lessonId,
    status: match.status,
    startedAt: match.startedAt,
    playerId,
    players: Object.values(match.players).map(publicPlayer),
  };
}

async function getOrCreateActiveMatch(matchCode) {
  let match = activeMatches.get(matchCode);
  if (match) return match;

  const persistedMatch = await Match.findOne({ code: matchCode }).select(
    "code lessonId status participants",
  );
  if (!persistedMatch) return null;

  match = {
    code: persistedMatch.code,
    lessonId: persistedMatch.lessonId,
    players: {},
    status: persistedMatch.status === "finished" ? "finished" : "waiting",
    startedAt: null,
    endedAt: null,
    countdownTimer: null,
    participants: persistedMatch.participants || [],
    rewardedWinnerUserId: null,
  };

  activeMatches.set(matchCode, match);
  return match;
}

async function syncMatchParticipants(match) {
  const persistedMatch = await Match.findOne({ code: match.code }).select(
    "participants",
  );
  match.participants = persistedMatch?.participants || [];
  return match.participants;
}

function findMatchParticipant(match, userId) {
  const safeUserId = String(userId || "");
  if (!isValidObjectId(safeUserId)) return null;

  return (match.participants || []).find(
    (participant) => String(participant.userId || "") === safeUserId,
  );
}

async function getUserLevelProgress(userId) {
  if (!isValidObjectId(userId)) return getMultiplayerLevelProgress();

  const user = await User.findById(userId).select("_id level points");
  if (!user) return getMultiplayerLevelProgress();

  return getMultiplayerLevelProgress(user);
}

function emitMatchState(io, match) {
  for (const player of Object.values(match.players)) {
    io.to(player.socketId).emit(
      "matchState",
      publicMatchState(match, player.socketId),
    );
  }
}

function cancelCountdown(match) {
  if (match.countdownTimer) {
    clearInterval(match.countdownTimer);
    match.countdownTimer = null;
  }
}

function elapsedBetween(startedAt, endedAt) {
  return startedAt ? Math.max(0, endedAt - startedAt) : 0;
}

function createRaceResult({
  typingState,
  result = {},
  startedAt,
  endedAt = Date.now(),
} = {}) {
  const safeTypingState = createTypingState(typingState);

  return {
    typingState: safeTypingState,
    wpm: clampNumber(
      result.wpm ?? safeTypingState.wpm,
      0,
      1000,
      safeTypingState.wpm,
    ),
    accuracy: clampNumber(
      result.accuracy ?? safeTypingState.accuracy,
      0,
      100,
      safeTypingState.accuracy,
    ),
    progress: clampNumber(
      result.progress ?? safeTypingState.progress,
      0,
      100,
      safeTypingState.progress,
    ),
    elapsedMs: clampNumber(
      result.elapsedMs,
      0,
      60 * 60 * 1000,
      elapsedBetween(startedAt, endedAt),
    ),
    finishedAt: result.finishedAt || safeTypingState.finishedAt,
  };
}

function buildResultForPlayer(player, endedAt, startedAt) {
  if (player.result) return player.result;
  return createRaceResult({
    typingState: player.typingState,
    startedAt,
    endedAt,
  });
}

function comparePlayersByResult(left, right) {
  const leftResult = left.result || {};
  const rightResult = right.result || {};
  const leftFinishedAt = Number(
    leftResult.finishedAt || Number.MAX_SAFE_INTEGER,
  );
  const rightFinishedAt = Number(
    rightResult.finishedAt || Number.MAX_SAFE_INTEGER,
  );

  if (leftFinishedAt !== rightFinishedAt) {
    return leftFinishedAt - rightFinishedAt;
  }

  const progressDifference =
    Number(rightResult.progress || 0) - Number(leftResult.progress || 0);
  if (progressDifference !== 0) return progressDifference;

  const wpmDifference =
    Number(rightResult.wpm || 0) - Number(leftResult.wpm || 0);
  if (wpmDifference !== 0) return wpmDifference;

  const accuracyDifference =
    Number(rightResult.accuracy || 0) - Number(leftResult.accuracy || 0);
  if (accuracyDifference !== 0) return accuracyDifference;

  return String(left.username || "").localeCompare(String(right.username || ""));
}

async function awardMultiplayerWin(player) {
  if (!player?.userId || !isValidObjectId(player.userId)) return null;

  const user = await User.findById(player.userId).select("_id level points");
  if (!user) return null;

  const previousProgress = getMultiplayerLevelProgress(user);
  const nextPoints = clampMultiplayerPoints(
    previousProgress.points + MULTIPLAYER_WIN_POINTS,
  );
  const earnedPoints = nextPoints - previousProgress.points;
  const nextLevel = getMultiplayerLevel(nextPoints);

  user.points = nextPoints;
  user.level = nextLevel;
  await user.save();

  const levelProgress = getMultiplayerLevelProgress(user);
  player.levelProgress = levelProgress;

  return {
    earnedPoints,
    previousLevel: previousProgress.level,
    previousPoints: previousProgress.points,
    levelProgress,
    leveledUp: levelProgress.level > previousProgress.level,
  };
}

async function persistFinishedMatch(match) {
  const participants = Object.values(match.players).map((player) => ({
    userId: isValidObjectId(player.userId) ? player.userId : null,
    username: player.username,
    progress: player.result?.progress ?? 0,
    wpm: player.result?.wpm ?? 0,
    accuracy: player.result?.accuracy ?? 100,
    finishedAt: player.result?.finishedAt
      ? new Date(player.result.finishedAt)
      : null,
  }));

  await Match.updateOne(
    { code: match.code },
    {
      $set: {
        status: "finished",
        participants,
        startedAt: match.startedAt ? new Date(match.startedAt) : null,
        endedAt: new Date(match.endedAt),
      },
    },
  );
}

function resetPlayerForRequeue(player) {
  player.typingState = createTypingState();
  player.isReady = false;
  player.isFinished = false;
  player.result = null;
}

async function finishMatch(io, match) {
  match.status = "finished";
  match.endedAt = Date.now();
  cancelCountdown(match);

  const rankedPlayers = Object.values(match.players)
    .map((player) => {
      player.result = buildResultForPlayer(
        player,
        match.endedAt,
        match.startedAt,
      );
      return player;
    })
    .sort(comparePlayersByResult);

  const winnerPlayer = rankedPlayers[0] || null;
  const levelRewards = {};

  if (
    winnerPlayer &&
    rankedPlayers.length >= 2 &&
    !match.rewardedWinnerUserId
  ) {
    const reward = await awardMultiplayerWin(winnerPlayer);
    if (reward) {
      match.rewardedWinnerUserId = winnerPlayer.userId;
      levelRewards[winnerPlayer.socketId] = reward;
    }
  }

  await persistFinishedMatch(match);

  const results = rankedPlayers.map(publicResult);

  io.to(roomName(match.code)).emit("raceFinished", {
    matchCode: match.code,
    results,
    players: rankedPlayers.map(publicPlayer),
    winner: winnerPlayer ? publicResult(winnerPlayer) : results[0] || null,
    levelRewards,
    endedAt: match.endedAt,
  });
  emitMatchState(io, match);
}

function startCountdown(io, match) {
  if (
    match.countdownTimer ||
    match.status === "racing" ||
    match.status === "finished"
  )
    return;

  let seconds = 3;
  match.status = "ready";
  emitMatchState(io, match);
  io.to(roomName(match.code)).emit("raceCountdown", {
    matchCode: match.code,
    seconds,
  });

  match.countdownTimer = setInterval(() => {
    seconds -= 1;

    if (seconds > 0) {
      io.to(roomName(match.code)).emit("raceCountdown", {
        matchCode: match.code,
        seconds,
      });
      return;
    }

    cancelCountdown(match);
    match.status = "racing";
    match.startedAt = Date.now();

    for (const player of Object.values(match.players)) {
      player.typingState = createTypingState({ isReady: true });
      player.isFinished = false;
      player.result = null;
    }

    io.to(roomName(match.code)).emit("raceStarted", {
      matchCode: match.code,
      startedAt: match.startedAt,
    });
    emitMatchState(io, match);
  }, 1000);
}

function getPlayerForSocket(socket, matchCode) {
  const normalizedCode = normalizeMatchCode(matchCode);
  const activeCode = socketMatches.get(socket.id);
  const match = activeMatches.get(normalizedCode);

  if (!match || activeCode !== normalizedCode) {
    return { match: null, player: null };
  }

  return { match, player: match.players[socket.id] || null };
}

function removeSocketFromMatch(io, socket, explicitMatchCode) {
  const matchCode = normalizeMatchCode(
    explicitMatchCode || socketMatches.get(socket.id),
  );
  if (!matchCode) return;

  const match = activeMatches.get(matchCode);
  if (!match) {
    socketMatches.delete(socket.id);
    return;
  }

  const player = match.players[socket.id];
  if (!player) {
    socketMatches.delete(socket.id);
    return;
  }

  delete match.players[socket.id];
  socketMatches.delete(socket.id);
  socket.to(roomName(matchCode)).emit("opponentDisconnected", {
    playerId: socket.id,
    username: player.username,
  });
  socket.leave(roomName(matchCode));

  const remainingPlayers = Object.values(match.players);
  if (remainingPlayers.length === 0) {
    cancelCountdown(match);
    activeMatches.delete(matchCode);
    return;
  }

  if (match.status === "ready" || match.status === "countdown") {
    cancelCountdown(match);
    match.status = "waiting";
  }

  emitMatchState(io, match);
}

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.on("joinMatch", async ({ matchCode, user } = {}) => {
      try {
        const code = normalizeMatchCode(matchCode);
        if (code.length !== MATCH_CODE_LENGTH) {
          emitMatchError(socket, "Invalid match code.");
          return;
        }

        const match = await getOrCreateActiveMatch(code);
        if (!match) {
          emitMatchError(socket, "Match not found.");
          return;
        }

        if (match.status === "racing" || match.status === "finished") {
          emitMatchError(socket, "This race has already started.");
          return;
        }

        if (
          !match.players[socket.id] &&
          Object.keys(match.players).length >= 2
        ) {
          emitMatchError(socket, "This match is already full.");
          return;
        }

        const safeUser = sanitizeUser(user);
        await syncMatchParticipants(match);
        const participant = findMatchParticipant(match, safeUser.userId);

        if (!participant) {
          emitMatchError(socket, "You are not a participant in this match.");
          return;
        }

        const levelProgress = await getUserLevelProgress(safeUser.userId);
        const player = {
          userId: safeUser.userId,
          username: participant.username || safeUser.username,
          socketId: socket.id,
          levelProgress,
          typingState: createTypingState(),
          isReady: false,
          isFinished: false,
          result: null,
        };

        match.players[socket.id] = player;
        socketMatches.set(socket.id, code);
        socket.join(roomName(code));

        socket.emit("matchState", publicMatchState(match, socket.id));
        socket
          .to(roomName(code))
          .emit("opponentJoined", { player: publicPlayer(player) });
        emitMatchState(io, match);
      } catch (error) {
        console.error("[socket:joinMatch]", error);
        emitMatchError(socket, "Unable to join match.");
      }
    });

    socket.on("playerReady", ({ matchCode } = {}) => {
      const { match, player } = getPlayerForSocket(socket, matchCode);
      if (!match || !player) {
        emitMatchError(socket, "You are not in this match.");
        return;
      }

      if (match.status === "racing" || match.status === "finished") return;

      player.isReady = true;
      player.typingState = createTypingState({
        ...player.typingState,
        isReady: true,
      });

      socket
        .to(roomName(match.code))
        .emit("opponentReady", { player: publicPlayer(player) });
      emitMatchState(io, match);

      const players = Object.values(match.players);
      if (players.length === 2 && players.every((entry) => entry.isReady)) {
        startCountdown(io, match);
      }
    });

    socket.on("typingStateUpdate", ({ matchCode, typingState } = {}) => {
      const { match, player } = getPlayerForSocket(socket, matchCode);
      if (!match || !player) {
        emitMatchError(socket, "You are not in this match.");
        return;
      }

      if (match.status !== "racing") {
        emitMatchError(
          socket,
          "Typing updates are only accepted after the race starts.",
        );
        return;
      }

      player.typingState = sanitizeTypingState(typingState);
      socket.to(roomName(match.code)).emit("opponentTypingState", {
        playerId: socket.id,
        typingState: player.typingState,
      });
    });

    socket.on("finishRace", async ({ matchCode, result } = {}) => {
      try {
        const { match, player } = getPlayerForSocket(socket, matchCode);
        if (!match || !player) {
          emitMatchError(socket, "You are not in this match.");
          return;
        }

        if (match.status !== "racing") {
          emitMatchError(socket, "This race is not active.");
          return;
        }

        const typingState = sanitizeTypingState(
          result?.typingState || player.typingState,
        );
        typingState.isFinished = true;
        typingState.finishedAt = typingState.finishedAt || Date.now();

        player.typingState = typingState;
        player.isFinished = true;
        player.result = createRaceResult({
          typingState,
          result,
          startedAt: match.startedAt,
          endedAt: typingState.finishedAt || Date.now(),
        });

        socket.to(roomName(match.code)).emit("opponentFinished", {
          player: publicPlayer(player),
          result: player.result,
        });
        emitMatchState(io, match);

        const allPlayersFinished = Object.values(match.players).every(
          (p) => p.isFinished,
        );
        if (allPlayersFinished) {
          await finishMatch(io, match);
        }
      } catch (error) {
        console.error("[socket:finishRace]", error);
        emitMatchError(socket, "Unable to finish this race.");
      }
    });

    socket.on("requeueMatch", async ({ matchCode } = {}) => {
      try {
        const { match, player } = getPlayerForSocket(socket, matchCode);
        if (!match || !player) {
          emitMatchError(socket, "You are not in this match.");
          return;
        }

        if (Object.keys(match.players).length < 2) {
          emitMatchError(socket, "Both players need to be in the match.");
          return;
        }

        if (match.status !== "finished") {
          if (match.status !== "waiting") {
            emitMatchError(
              socket,
              "This match can only be requeued after the race finishes.",
            );
            return;
          }

          socket.emit("matchRequeued", {
            matchCode: match.code,
            lessonId: match.lessonId,
            requestedBy: publicPlayer(player),
          });
          emitMatchState(io, match);
          return;
        }

        const nextLessonId = match.lessonId + 1;
        if (nextLessonId > MAX_LESSON_ID) {
          emitMatchError(socket, "There is no next lesson for this match.");
          return;
        }

        cancelCountdown(match);
        match.lessonId = nextLessonId;
        match.status = "waiting";
        match.startedAt = null;
        match.endedAt = null;
        match.rewardedWinnerUserId = null;

        for (const entry of Object.values(match.players)) {
          resetPlayerForRequeue(entry);
        }

        await Match.updateOne(
          { code: match.code },
          {
            $set: {
              lessonId: nextLessonId,
              status: "waiting",
              startedAt: null,
              endedAt: null,
            },
          },
        );

        io.to(roomName(match.code)).emit("matchRequeued", {
          matchCode: match.code,
          lessonId: nextLessonId,
          requestedBy: publicPlayer(player),
        });
        emitMatchState(io, match);
      } catch (error) {
        console.error("[socket:requeueMatch]", error);
        emitMatchError(socket, "Unable to requeue this match.");
      }
    });

    socket.on("leaveMatch", ({ matchCode } = {}) => {
      removeSocketFromMatch(io, socket, matchCode);
    });

    socket.on("disconnect", () => {
      removeSocketFromMatch(io, socket);
    });
  });
}
