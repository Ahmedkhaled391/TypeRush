import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Stats from "./Stats";
import { getBestStars, getLesson, submitLessonAttempt } from "../../services/lessonsService";
import {
    calculateWpm,
    calculateAccuracy,
    calculateProgress,
} from "../../services/typingMetrics";

const MAX_LESSONS = 100;


function destructLesson(text) {
    return text.split("").map((char, index) => ({ char, index }));
}


function getCharStatus(index, typed, lessonText, mistakeCounts) {
    if (index >= typed.length) return "neutral";
    if (typed[index] === lessonText[index]) {
        return mistakeCounts[index] > 0 ? "corrected" : "correct";
    }
    return "wrong";
}

const STATUS_CLASSES = {
    neutral: "bg-transparent text-slate-500",
    correct: "bg-emerald-600 text-slate-900 dark:text-white",
    wrong: "bg-rose-600 text-slate-900 dark:text-white",
    corrected: "bg-amber-400 text-black",
};

function Practise() {
    const { lessonNumber } = useParams();
    const navigate = useNavigate();
    const [lessonText, setLessonText]         = useState("");
    const [lessonTitle, setLessonTitle]       = useState("");
    const [wpmRequirement, setWpmRequirement] = useState(20);
    const [accRequirement, setAccRequirement] = useState(75);
    const [typed, setTyped]                   = useState("");
    const [mistakeCounts, setMistakeCounts]   = useState([]);
    const [startedAt, setStartedAt]           = useState(null);
    const [wpmTickTime, setWpmTickTime]       = useState(0);
    const containerRef = useRef(null);

    const parsedLessonNumber = Number(lessonNumber);
    const isValidLesson =Number.isInteger(parsedLessonNumber) && parsedLessonNumber >= 1 && parsedLessonNumber <= MAX_LESSONS;

    useEffect(() => {
        if (!isValidLesson) return;
        const lesson = getLesson(parsedLessonNumber);
        if (!lesson) return;
        setLessonTitle(lesson.title);
        setLessonText(lesson.text);
        setWpmRequirement(lesson.wpmRequirement ?? 20);
        setAccRequirement(lesson.accuracyRequirement ?? 75);
        setTyped("");
        setMistakeCounts(new Array(lesson.text.length).fill(0));
        setStartedAt(null);
        setWpmTickTime(0);
    }, [isValidLesson, parsedLessonNumber]);

    useEffect(() => {
        containerRef.current?.focus();
    }, [lessonText]);

    const chars = useMemo(() => destructLesson(lessonText), [lessonText]);

    const handleKeyDown = useCallback(
        (e) => {
            if (!lessonText) return;

            if (e.key === "Backspace") {
                e.preventDefault();
                setTyped((prev) => prev.slice(0, -1));
                return;
            }

            if (e.key.length !== 1 || e.ctrlKey || e.metaKey) return;

            if (typed.length >= lessonText.length) return;

            const pos = typed.length;

            if (!startedAt) {
                const now = Date.now();
                setStartedAt(now);
                setWpmTickTime(now);
            }

            if (e.key !== lessonText[pos]) {
                setMistakeCounts((prev) => {
                    const next = [...prev];
                    next[pos] = next[pos] + 1;
                    return next;
                });
            }

            const newTyped = typed + e.key;
            setTyped(newTyped);

            
            if (newTyped.length >= lessonText.length) {
                const endTime = Date.now();
                const elapsed = startedAt ? endTime - startedAt : 0;
                const totalMistakesNow = mistakeCounts.reduce((s, c) => s + c, 0)
                    + (e.key !== lessonText[pos] ? 1 : 0);
                let correctNow = 0;
                for (let i = 0; i < newTyped.length; i++) {
                    if (newTyped[i] === lessonText[i]) correctNow++;
                }
                const finalWpm = calculateWpm(correctNow, elapsed);
                const finalAccuracy = calculateAccuracy(newTyped.length, totalMistakesNow);
                const prevBestBeforeAttempt = getBestStars(parsedLessonNumber);

                const finishAttempt = async () => {
                    let stars = 0;
                    let passed = false;

                    try {
                        const submission = await submitLessonAttempt({
                            lessonId: parsedLessonNumber,
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

                    navigate(`/lessons/${parsedLessonNumber}/results`, {
                        state: {
                            lessonNumber: parsedLessonNumber,
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
        [lessonText, typed, startedAt, mistakeCounts, wpmRequirement, accRequirement, parsedLessonNumber, navigate]
    );

    useEffect(() => {
        if (!startedAt) return;
        const timer = setInterval(() => setWpmTickTime(Date.now()), 1500);
        return () => clearInterval(timer);
    }, [startedAt]);

    if (!isValidLesson) {
        return (
            <section className="container mx-auto mt-10 rounded-2xl bg-panel p-6 text-center">
                <h2 className="text-2xl font-bold text-brand-heading">Invalid Lesson</h2>
                <p className="mt-2 paragraph-muted-md">This lesson isn't available.</p>
            </section>
        );
    }

    const totalMistakes = useMemo(
        () => mistakeCounts.reduce((sum, count) => sum + count, 0),
        [mistakeCounts]
    );
    const correctChars = useMemo(() => {
        let correct = 0;
        for (let i = 0; i < typed.length; i++) {
            if (typed[i] === lessonText[i]) correct += 1;
        }
        return correct;
    }, [typed, lessonText]);
    const elapsedMs = startedAt && wpmTickTime ? wpmTickTime - startedAt : 0;
    const wpm = calculateWpm(correctChars, elapsedMs);
    const accuracy = calculateAccuracy(typed.length, totalMistakes);
    const progress = calculateProgress(typed.length, lessonText.length);

    return (
        <>
            <Stats title={lessonTitle} wpm={wpm} accuracy={accuracy} progress={progress} />
            <div
                ref={containerRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className="content container mx-auto mt-10 rounded-2xl bg-[#10141b] text-slate-500 p-10 outline-none cursor-text"
            >
                <div className="flex flex-wrap font-mono text-3xl md:text-4xl leading-relaxed">
                    {chars.map(({ char, index }) => {
                        const status = getCharStatus(index, typed, lessonText, mistakeCounts);
                        const isCursor = index === typed.length && typed.length < lessonText.length;
                        const display = char === " " ? "\u00A0" : char;

                        return (
                            <span
                                key={index}
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
            </div>
        </>
    );
}

export default Practise;
