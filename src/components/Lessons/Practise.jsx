import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Stats from "./Stats";
import { TextDisplayContainer } from "../ui/TextDisplayContainer";
import {
  getBestStars,
  getLesson,
  submitLessonAttempt,
} from "../../services/lessonsService";
import {
  applyTypingKeyToState,
  createInitialTypingState,
  getCharStatus,
  updateTypingStateMetrics,
} from "../../services/typingMetrics";

const MAX_LESSONS = 100;

const STATUS_CLASSES = {
  neutral: "bg-transparent text-slate-500",
  correct: "bg-emerald-600 text-slate-900 dark:text-white",
  wrong: "bg-rose-600 text-slate-900 dark:text-white",
  corrected: "bg-amber-400 text-black",
};

export function TypingTextDisplay({ lessonText, typingState, className = "" }) {
  const typedText = typingState?.typedText || "";
  const mistakeIndexes = Array.isArray(typingState?.mistakeIndexes)
    ? typingState.mistakeIndexes
    : [];
  const chars = lessonText.split("").map((char, index) => ({ char, index }));

  return (
    <div
      className={[
        "w-full flex flex-wrap font-mono text-3xl md:text-4xl leading-relaxed",
        className,
      ].join(" ")}
    >
      {chars.map(({ char, index }) => {
        const status = getCharStatus(
          index,
          typedText,
          lessonText,
          mistakeIndexes,
        );
        const isCursor =
          index === typedText.length && typedText.length < lessonText.length;
        const display = char === " " ? "\u00A0" : char;

        return (
          <span
            key={index}
            data-typing-cursor={isCursor ? "true" : undefined}
            className={[
              "inline-block border border-slate-300 dark:border-slate-700",
              index > 0 ? "-ml-px" : "",
              "px-1 py-0.5",
              STATUS_CLASSES[status],
              isCursor ? "border-blue-400 border-2 z-10 relative" : "",
            ].join(" ")}
          >
            {display}
          </span>
        );
      })}
    </div>
  );
}

function Practise() {
  const { lessonNumber } = useParams();
  const parsedLessonNumber = Number(lessonNumber);
  const isValidLesson =
    Number.isInteger(parsedLessonNumber) &&
    parsedLessonNumber >= 1 &&
    parsedLessonNumber <= MAX_LESSONS;
  const lesson = isValidLesson ? getLesson(parsedLessonNumber) : null;

  if (!isValidLesson || !lesson) {
    return (
      <section className="container mx-auto mt-10 rounded-2xl bg-panel p-6 text-center">
        <h2 className="text-2xl font-bold text-brand-heading">
          Invalid Lesson
        </h2>
        <p className="mt-2 paragraph-muted-md">This lesson isn't available.</p>
      </section>
    );
  }

  return (
    <PractiseLesson
      key={parsedLessonNumber}
      lesson={lesson}
      lessonNumber={parsedLessonNumber}
    />
  );
}

function PractiseLesson({ lesson, lessonNumber }) {
  const navigate = useNavigate();
  const [typingState, setTypingState] = useState(() =>
    createInitialTypingState(),
  );
  const [startedAt, setStartedAt] = useState(null);
  const [wpmTickTime, setWpmTickTime] = useState(0);
  const containerRef = useRef(null);
  const lessonText = lesson.text;
  const lessonTitle = lesson.title;
  const wpmRequirement = lesson.wpmRequirement ?? 20;
  const accRequirement = lesson.accuracyRequirement ?? 75;

  useEffect(() => {
    containerRef.current?.focus();
  }, [lessonText]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!lessonText || typingState.isFinished) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        const now = Date.now();
        const elapsed = startedAt ? now - startedAt : 0;
        setTypingState((prev) =>
          applyTypingKeyToState({
            typingState: prev,
            lessonText,
            key: e.key,
            elapsedMs: elapsed,
            now,
          }),
        );
        return;
      }

      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();

      if (typingState.typedText.length >= lessonText.length) return;

      const now = Date.now();
      const startTime = startedAt || now;
      if (!startedAt) {
        setStartedAt(startTime);
      }
      setWpmTickTime(now);

      const nextState = applyTypingKeyToState({
        typingState,
        lessonText,
        key: e.key,
        elapsedMs: now - startTime,
        now,
      });
      setTypingState(nextState);

      if (!typingState.isFinished && nextState.isFinished) {
        const elapsed = now - startTime;
        const finalWpm = nextState.wpm;
        const finalAccuracy = nextState.accuracy;
        const prevBestBeforeAttempt = getBestStars(lessonNumber);

        const finishAttempt = async () => {
          let stars = 0;
          let passed = false;

          try {
            const submission = await submitLessonAttempt({
              lessonId: lessonNumber,
              wpm: finalWpm,
              accuracy: finalAccuracy,
              elapsedMs: elapsed,
              wpmRequirement,
              accuracyRequirement: accRequirement,
            });
            stars = submission.stars;
            passed = submission.passed;
          } catch {
            // If API submission fails, keep UX flow and show result page.
          }

          navigate(`/lessons/${lessonNumber}/results`, {
            state: {
              lessonNumber,
              wpm: finalWpm,
              accuracy: finalAccuracy,
              elapsedMs: elapsed,
              wpmRequirement,
              accuracyRequirement: accRequirement,
              stars,
              passed,
              prevBestBeforeAttempt,
            },
          });
        };

        finishAttempt();
      }
    },
    [
      lessonText,
      typingState,
      startedAt,
      wpmRequirement,
      accRequirement,
      lessonNumber,
      navigate,
    ],
  );

  useEffect(() => {
    if (!startedAt || typingState.isFinished) return;
    const timer = setInterval(() => setWpmTickTime(Date.now()), 1500);
    return () => clearInterval(timer);
  }, [startedAt, typingState.isFinished]);

  const displayTypingState =
    startedAt && wpmTickTime && !typingState.isFinished
      ? updateTypingStateMetrics(
          typingState,
          lessonText,
          wpmTickTime - startedAt,
        )
      : typingState;

  return (
    <>
      <div className="container mx-auto mt-8 flex items-center justify-between gap-4 px-4 sm:px-0">
        <button
          type="button"
          onClick={() => navigate("/lessons")}
          className="inline-flex items-center rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
        >
          Back
        </button>
      </div>
      <Stats
        title={lessonTitle}
        wpm={displayTypingState.wpm}
        accuracy={displayTypingState.accuracy}
        progress={displayTypingState.progress}
      />
      <TextDisplayContainer
        lessonText={lessonText}
        typingState={displayTypingState}
        containerRef={containerRef}
        onKeyDown={handleKeyDown}
        variant="solo"
      />
    </>
  );
}

export default Practise;
