import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MatchResults from "./MatchResults";
import TypingRacePanel from "./TypingRacePanel";
import { getCachedUser } from "../../services/authService";
import { getLesson } from "../../services/lessonsService";
import { getMatchByCode } from "../../services/matchService";
import { socket } from "../../services/socket";
import {
  applyTypingKeyToState,
  createInitialTypingState,
  toPublicTypingState,
  updateTypingStateMetrics,
} from "../../services/typingMetrics";
import { throttle } from "../../utils/throttle";

function getPublicUser() {
  const user = getCachedUser();
  return {
    userId: String(user?.id || user?._id || ""),
    username: user?.username || "Player",
  };
}

function getPlayerStatus(typingState, raceStatus) {
  if (typingState.isFinished) return "Finished";
  if (raceStatus === "racing") return "Racing";
  if (typingState.isReady) return "Ready";
  return "Waiting";
}

function MatchRace() {
  const { code } = useParams();
  const matchCode = String(code || "").toUpperCase();
  const [lesson, setLesson] = useState(null);
  const [matchStatus, setMatchStatus] = useState("loading");
  const [countdown, setCountdown] = useState(null);
  const [myTypingState, setMyTypingState] = useState(() =>
    createInitialTypingState(),
  );
  const [opponentTypingState, setOpponentTypingState] = useState(() =>
    createInitialTypingState(),
  );
  const [showGoSignal, setShowGoSignal] = useState(false);
  const [opponentName, setOpponentName] = useState("Opponent");
  const [myPlayerId, setMyPlayerId] = useState("");
  const myPlayerIdRef = useRef("");
  const [startedAt, setStartedAt] = useState(null);
  const [raceResult, setRaceResult] = useState(null);
  const [error, setError] = useState("");
  const currentUser = useMemo(() => getPublicUser(), []);

  const resetRaceForLesson = useCallback((lessonId) => {
    const nextLesson = getLesson(Number(lessonId));
    if (!nextLesson) {
      setError("The next lesson is not available.");
      setMatchStatus("error");
      return;
    }

    setLesson(nextLesson);
    setMatchStatus("waiting");
    setCountdown(null);
    setStartedAt(null);
    setRaceResult(null);
    setMyTypingState(createInitialTypingState());
    setOpponentTypingState(createInitialTypingState());
    setShowGoSignal(false);
    setError("");
  }, []);

  const emitTypingState = useMemo(
    () =>
      throttle((typingState) => {
        if (!socket.connected) return;
        socket.emit("typingStateUpdate", {
          matchCode,
          typingState: toPublicTypingState(typingState),
        });
      }, 100),
    [matchCode],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadMatch() {
      try {
        setError("");
        const match = await getMatchByCode(matchCode);
        if (cancelled) return;

        const matchLesson = getLesson(match.lessonId);
        if (!matchLesson) {
          setError("This match points to a lesson that is not available.");
          setMatchStatus("error");
          return;
        }

        setLesson(matchLesson);
        setMatchStatus((prev) => (prev === "loading" ? "waiting" : prev));
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Unable to load this match.");
        setMatchStatus("error");
      }
    }

    loadMatch();

    return () => {
      cancelled = true;
    };
  }, [matchCode]);

  useEffect(() => {
    if (!matchCode) return undefined;

    const handleMatchState = (payload = {}) => {
      const players = payload.players || [];
      const opponent = players.find(
        (player) => player.playerId !== payload.playerId,
      );
      const me = players.find((player) => player.playerId === payload.playerId);

      if (payload.lessonId) {
        const matchLesson = getLesson(Number(payload.lessonId));
        if (matchLesson) {
          setLesson((prev) =>
            prev?.id === matchLesson.id ? prev : matchLesson,
          );
        }
      }

      if (payload.playerId) {
        myPlayerIdRef.current = payload.playerId;
        setMyPlayerId(payload.playerId);
      }
      if (payload.status) {
        setMatchStatus(payload.status);
      }
      if ("startedAt" in payload) {
        setStartedAt(payload.startedAt || null);
      }
      if (opponent) {
        setOpponentName(opponent.username || "Opponent");
        setOpponentTypingState(createInitialTypingState(opponent.typingState));
      }
      if (me?.typingState) {
        setMyTypingState(createInitialTypingState(me.typingState));
      }
    };

    const handleOpponentJoined = ({ player } = {}) => {
      if (!player) return;
      setOpponentName(player.username || "Opponent");
      setOpponentTypingState(createInitialTypingState(player.typingState));
    };

    const handleOpponentTypingState = ({ typingState } = {}) => {
      setOpponentTypingState(createInitialTypingState(typingState));
    };

    const handleOpponentReady = ({ player } = {}) => {
      if (player?.username) {
        setOpponentName(player.username);
      }
      setOpponentTypingState((prev) =>
        createInitialTypingState({ ...prev, isReady: true }),
      );
    };

    const handleRaceCountdown = ({ seconds } = {}) => {
      setMatchStatus("countdown");
      setCountdown(seconds ?? null);
    };

    const handleRaceStarted = ({ startedAt: raceStartedAt } = {}) => {
      setMatchStatus("racing");
      setShowGoSignal(true);
      setStartedAt(raceStartedAt || Date.now());
      setRaceResult(null);
      setMyTypingState(() => createInitialTypingState({ isReady: true }));
      setOpponentTypingState(() => createInitialTypingState({ isReady: true }));
    };

    const handleOpponentFinished = ({ player, result } = {}) => {
      if (player?.username) {
        setOpponentName(player.username);
      }
      setOpponentTypingState((prev) =>
        createInitialTypingState({
          ...prev,
          ...(result?.typingState || {}),
          isFinished: true,
          finishedAt: result?.finishedAt || Date.now(),
        }),
      );
    };

    const handleRaceFinished = (payload = {}) => {
      setMatchStatus("finished");
      setRaceResult(payload);

      const players = payload.players || [];
      const localPlayerId = myPlayerIdRef.current;
      const me = players.find((player) => player.playerId === localPlayerId);
      const opponent = players.find(
        (player) => player.playerId !== localPlayerId,
      );

      if (me?.typingState) {
        setMyTypingState(createInitialTypingState(me.typingState));
      }
      if (opponent?.typingState) {
        setOpponentName(opponent.username || "Opponent");
        setOpponentTypingState(createInitialTypingState(opponent.typingState));
      }
    };

    const handleMatchRequeued = ({ lessonId } = {}) => {
      resetRaceForLesson(lessonId);
    };

    const handleOpponentDisconnected = () => {
      setOpponentName("Opponent");
      setOpponentTypingState(createInitialTypingState());
      setMatchStatus((prev) => (prev === "finished" ? prev : "waiting"));
    };

    const handleMatchError = ({ message } = {}) => {
      setError(message || "Something went wrong in this match.");
    };

    socket.on("matchState", handleMatchState);
    socket.on("opponentJoined", handleOpponentJoined);
    socket.on("opponentTypingState", handleOpponentTypingState);
    socket.on("opponentReady", handleOpponentReady);
    socket.on("raceCountdown", handleRaceCountdown);
    socket.on("raceStarted", handleRaceStarted);
    socket.on("opponentFinished", handleOpponentFinished);
    socket.on("raceFinished", handleRaceFinished);
    socket.on("matchRequeued", handleMatchRequeued);
    socket.on("opponentDisconnected", handleOpponentDisconnected);
    socket.on("matchError", handleMatchError);

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("joinMatch", {
      matchCode,
      user: currentUser,
    });

    return () => {
      emitTypingState.cancel();
      socket.emit("leaveMatch", { matchCode });
      socket.off("matchState", handleMatchState);
      socket.off("opponentJoined", handleOpponentJoined);
      socket.off("opponentTypingState", handleOpponentTypingState);
      socket.off("opponentReady", handleOpponentReady);
      socket.off("raceCountdown", handleRaceCountdown);
      socket.off("raceStarted", handleRaceStarted);
      socket.off("opponentFinished", handleOpponentFinished);
      socket.off("raceFinished", handleRaceFinished);
      socket.off("matchRequeued", handleMatchRequeued);
      socket.off("opponentDisconnected", handleOpponentDisconnected);
      socket.off("matchError", handleMatchError);
      socket.disconnect();
    };
  }, [currentUser, emitTypingState, matchCode, resetRaceForLesson]);

  useEffect(() => {
    if (
      matchStatus !== "racing" ||
      !startedAt ||
      !lesson ||
      myTypingState.isFinished
    ) {
      return undefined;
    }

    const timer = setInterval(() => {
      setMyTypingState((prev) => {
        const next = updateTypingStateMetrics(
          prev,
          lesson.text,
          Date.now() - startedAt,
        );
        emitTypingState(next);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    emitTypingState,
    lesson,
    matchStatus,
    myTypingState.isFinished,
    startedAt,
  ]);

  useEffect(() => {
    if (!showGoSignal) return undefined;

    const timeout = setTimeout(() => {
      setShowGoSignal(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [showGoSignal]);

  const handleReady = () => {
    setMyTypingState((prev) =>
      createInitialTypingState({ ...prev, isReady: true }),
    );
    socket.emit("playerReady", { matchCode });
  };

  const handleNextLesson = useCallback(() => {
    if (!lesson || lesson.id >= 100) return;

    setError("");
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("requeueMatch", { matchCode });
  }, [lesson, matchCode]);

  const handleTypingChange = useCallback(
    (e) => {
      if (matchStatus !== "racing" || !lesson || myTypingState.isFinished)
        return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key !== "Backspace" && e.key.length !== 1) return;

      e.preventDefault();

      const now = Date.now();
      const raceStartedAt = startedAt || now;
      const nextState = applyTypingKeyToState({
        typingState: myTypingState,
        lessonText: lesson.text,
        key: e.key,
        elapsedMs: now - raceStartedAt,
        now,
      });

      setMyTypingState(nextState);
      emitTypingState(nextState);

      if (!myTypingState.isFinished && nextState.isFinished) {
        emitTypingState.flush();
        socket.emit("finishRace", {
          matchCode,
          result: {
            typingState: toPublicTypingState(nextState),
            wpm: nextState.wpm,
            accuracy: nextState.accuracy,
            progress: nextState.progress,
            elapsedMs: now - raceStartedAt,
            finishedAt: nextState.finishedAt,
          },
        });
      }
    },
    [emitTypingState, lesson, matchCode, matchStatus, myTypingState, startedAt],
  );

  const statusCopy = {
    loading: "Loading match",
    waiting: "Waiting for both players",
    ready: "Both players ready",
    countdown: countdown ? `Starting in ${countdown}` : "Starting",
    racing: "Race in progress",
    finished: "Race finished",
    error: "Match unavailable",
  };

  const winnerName = raceResult?.winner?.username;

  return (
    <main className="relative h-full overflow-hidden p-3 sm:p-4">
      <section className="flex h-full min-h-0 flex-col gap-3">
        <header className="shrink-0 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm lg:flex lg:items-center lg:justify-between dark:border-white/10 dark:bg-linear-to-b dark:from-dark-gray dark:to-dark-navy-gray">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-vibrant-mint-green">
              Match {matchCode}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-brand-heading">
              {lesson?.title || "Typing Race"}
            </h1>
            <p className="mt-2 paragraph-muted-sm">
              {error || statusCopy[matchStatus]}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 lg:mt-0">
            {winnerName && matchStatus !== "finished" && (
              <span className="rounded-xl bg-emerald-400/10 px-4 py-3 font-semibold text-vibrant-mint-green">
                Winner: {winnerName}
              </span>
            )}
            {matchStatus !== "racing" &&
              matchStatus !== "finished" &&
              !myTypingState.isReady &&
              !error && (
                <button
                  type="button"
                  onClick={handleReady}
                  className="rounded-xl bg-linear-to-r from-light-mint-green to-vibrant-mint-green px-5 py-3 font-extrabold text-dark-mint-green transition hover:brightness-105"
                >
                  Ready
                </button>
              )}
            <Link
              to="/challenge"
              className="rounded-xl border border-white/10 bg-panel px-5 py-3 font-semibold text-brand-heading"
            >
              Leave
            </Link>
          </div>
        </header>

        {showGoSignal && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex justify-center px-4">
            <div className="animate-pulse rounded-3xl border border-emerald-300/30 bg-emerald-400/10 px-8 py-6 text-center text-4xl font-black uppercase tracking-[0.4em] text-emerald-200 shadow-[0_0_60px_rgba(0,252,154,0.35)] backdrop-blur-sm sm:text-5xl">
              GO!
            </div>
          </div>
        )}

        {matchStatus === "finished" && raceResult ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <MatchResults
              lesson={lesson}
              raceResult={raceResult}
              myPlayerId={myPlayerId}
              myTypingState={myTypingState}
              opponentTypingState={opponentTypingState}
              currentUserName={currentUser.username}
              opponentName={opponentName}
              startedAt={startedAt}
              onNextLesson={handleNextLesson}
            />
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-rows-2 gap-3 lg:grid-cols-2 lg:grid-rows-1">
            <TypingRacePanel
              playerName={currentUser.username}
              lessonText={lesson?.text || ""}
              typingState={myTypingState}
              isLocalPlayer
              isInputEnabled={
                matchStatus === "racing" && !myTypingState.isFinished
              }
              onTypingChange={handleTypingChange}
              statusLabel={getPlayerStatus(myTypingState, matchStatus)}
            />
            <TypingRacePanel
              playerName={opponentName}
              lessonText={lesson?.text || ""}
              typingState={opponentTypingState}
              isLocalPlayer={false}
              statusLabel={getPlayerStatus(opponentTypingState, matchStatus)}
            />
          </div>
        )}
      </section>
    </main>
  );
}

export default MatchRace;
