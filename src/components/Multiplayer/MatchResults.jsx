import { useNavigate } from "react-router-dom";
import LessonResults from "../Lessons/LessonResults";
import { buildMultiplayerLevelProgress } from "../../services/multiplayerLevel";
import { createInitialTypingState } from "../../services/typingMetrics";

function getElapsedMs(result, raceResult, startedAt) {
  return result.elapsedMs ??
    (raceResult?.endedAt && startedAt ? Math.max(0, raceResult.endedAt - startedAt) : 0);
}

function getLessonRequirements(lesson) {
  return {
    wpmRequirement: lesson?.wpmRequirement ?? 20,
    accuracyRequirement: lesson?.accuracyRequirement ?? 75,
  };
}

function toLessonResult({ player, fallbackTypingState, lesson, raceResult, startedAt }) {
  const result = player?.result || {};
  const typingState = createInitialTypingState(result.typingState || player?.typingState || fallbackTypingState);

  return {
    ...getLessonRequirements(lesson),
    wpm: result.wpm ?? typingState.wpm,
    accuracy: result.accuracy ?? typingState.accuracy,
    elapsedMs: getElapsedMs(result, raceResult, startedAt),
    progress: result.progress ?? typingState.progress,
  };
}

function MatchResults({
  lesson,
  raceResult,
  myPlayerId,
  myTypingState,
  opponentTypingState,
  currentUserName,
  opponentName,
  startedAt,
  onNextLesson,
}) {
  const navigate = useNavigate();
  const players = raceResult?.players || [];
  const localPlayer = players.find((player) => player.playerId === myPlayerId);
  const opponentPlayer = players.find((player) => player.playerId !== myPlayerId);
  const winnerName = raceResult?.winner?.username || "Winner";
  const lessonNumber = lesson?.id || 1;
  const localReward = raceResult?.levelRewards?.[myPlayerId] || null;
  const rewardProgress = buildMultiplayerLevelProgress(
    localReward?.levelProgress,
  );

  const localResult = toLessonResult({
    player: localPlayer,
    fallbackTypingState: myTypingState,
    lesson,
    raceResult,
    startedAt,
  });
  const opponentResult = toLessonResult({
    player: opponentPlayer,
    fallbackTypingState: opponentTypingState,
    lesson,
    raceResult,
    startedAt,
  });

  const handleLeaveResults = () => {
    navigate("/challenge");
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-6 py-5 text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-vibrant-mint-green">Race Winner</p>
        <h2 className="mt-2 text-4xl font-extrabold text-brand-heading">{winnerName}</h2>
      </div>

      {localReward && (
        <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-amber-300">
                Victory Bonus
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-brand-heading">
                {localReward.earnedPoints > 0
                  ? `+${localReward.earnedPoints} points`
                  : "Max level reached"}
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-semibold text-brand-heading">
                Level {rewardProgress.level}
              </p>
              <p className="mt-1 text-sm text-brand-muted">
                {rewardProgress.isMaxLevel
                  ? "Max level reached"
                  : `${rewardProgress.pointsInLevel}/${rewardProgress.pointsPerLevel} points`}
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-amber-300/30">
            <div
              className="h-full rounded-full bg-vibrant-mint-green transition-all duration-500"
              style={{ width: `${rewardProgress.progressPercent}%` }}
            />
          </div>
          {localReward.leveledUp && (
            <p className="mt-3 text-sm font-bold text-vibrant-mint-green">
              Level up: {localReward.previousLevel} to {rewardProgress.level}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <div>
          <p className="text-center text-sm uppercase tracking-[0.2em] text-brand-muted">
            {currentUserName}
          </p>
          <LessonResults
            lessonNumber={lessonNumber}
            wpm={localResult.wpm}
            accuracy={localResult.accuracy}
            elapsedMs={localResult.elapsedMs}
            wpmRequirement={localResult.wpmRequirement}
            accuracyRequirement={localResult.accuracyRequirement}
            prevBestBeforeAttempt={0}
            onRetry={handleLeaveResults}
            onNextLesson={onNextLesson}
          />
        </div>

        <div>
          <p className="text-center text-sm uppercase tracking-[0.2em] text-brand-muted">
            {opponentPlayer?.username || opponentName}
          </p>
          <LessonResults
            lessonNumber={lessonNumber}
            wpm={opponentResult.wpm}
            accuracy={opponentResult.accuracy}
            elapsedMs={opponentResult.elapsedMs}
            wpmRequirement={opponentResult.wpmRequirement}
            accuracyRequirement={opponentResult.accuracyRequirement}
            prevBestBeforeAttempt={0}
            onRetry={handleLeaveResults}
            onNextLesson={onNextLesson}
            showActions={false}
          />
        </div>
      </div>
    </section>
  );
}

export default MatchResults;
