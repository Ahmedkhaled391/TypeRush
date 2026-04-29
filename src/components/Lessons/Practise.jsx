import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import Stats from "./Stats";
import { getLesson } from "../../services/lessonsService";
import {
    calculateWpm,
    calculateAccuracy,
    calculateProgress,
} from "../../services/typingMetrics";

const MAX_LESSONS = 100;


function destructLesson(text) {
    return text.split("").map((char, index) => ({ char, index }));
}


function isCorrectInput(userInput, lessonText) {
    return userInput === lessonText;
}


function getCharStatus(index, typed, lessonText, mistakeCounts) {
    if (index >= typed.length) return "neutral";
    if (typed[index] === lessonText[index]) {
        return mistakeCounts[index] > 0 ? "corrected" : "correct";
        // corrected means user made a mistake at this position but later corrected it (this will appear as yellow not green)
    }
    return "wrong";
}

const STATUS_CLASSES = {
    neutral: "bg-transparent text-slate-500",
    correct: "bg-emerald-600 text-white",
    wrong: "bg-rose-600 text-white",
    corrected: "bg-amber-400 text-black",
};

function Practise() {
    const { lessonNumber } = useParams();
    const [lessonText, setLessonText]       = useState("");
    const [lessonTitle, setLessonTitle]     = useState("");
    const [typed, setTyped]                 = useState("");
    const [mistakeCounts, setMistakeCounts] = useState([]);
    const [startedAt, setStartedAt] = useState(null);
    const [wpmTickTime, setWpmTickTime] = useState(0);
    const containerRef = useRef(null);

    const parsedLessonNumber = Number(lessonNumber);
    const isValidLesson =
        Number.isInteger(parsedLessonNumber) &&
        parsedLessonNumber >= 1 &&
        parsedLessonNumber <= MAX_LESSONS;

    // Load lesson data and reset typing state whenever the lesson changes.
    useEffect(() => {
        if (!isValidLesson) return;
        const lesson = getLesson(parsedLessonNumber);
        if (!lesson) return;
        setLessonTitle(lesson.title);
        setLessonText(lesson.text);
        setTyped("");
        setMistakeCounts(new Array(lesson.text.length).fill(0));
        setStartedAt(null);
        setWpmTickTime(0);
    }, [isValidLesson, parsedLessonNumber]);

    // Auto-focus the container so the user can start typing immediately.
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

            // Ignore modifier-only keys, Tab, Enter, etc.
            if (e.key.length !== 1 || e.ctrlKey || e.metaKey) return;

            // Don't go past the end of the lesson.
            if (typed.length >= lessonText.length) return;

            const pos         = typed.length;
            const expectedChar = lessonText[pos];

            if (!startedAt) {
                const now = Date.now();
                setStartedAt(now);
                setWpmTickTime(now);
            }

            // Record a mistake at this position if the key is wrong.
            if (e.key !== expectedChar) {
                setMistakeCounts((prev) => {
                    const next = [...prev];
                    next[pos] = next[pos] + 1;
                    return next;
                });
            }

            setTyped((prev) => prev + e.key);
        },
        [lessonText, typed, startedAt]
    );

    const completed = isCorrectInput(typed, lessonText);

    useEffect(() => {
        if (!startedAt || completed) return;

        const timer = setInterval(() => {
            setWpmTickTime(Date.now());
        }, 1500);

        return () => clearInterval(timer);
    }, [startedAt, completed]);

    useEffect(() => {
        if (completed) {
            setWpmTickTime(Date.now());
        }
    }, [completed]);

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
                {/* Character grid — each char shares borders with its neighbours */}
                <div className="flex flex-wrap font-mono text-3xl md:text-4xl leading-relaxed">
                    {chars.map(({ char, index }) => {
                        const status= getCharStatus(index, typed, lessonText, mistakeCounts);
                        const isCursor= index===typed.length && !completed;
                        const display= char === " " ? "\u00A0" : char;

                        return (
                            <span
                                key={index}
                                className={[
                                    "inline-block border border-slate-700",
                                    
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

                {completed && (
                    <p className="mt-6 text-green-400 font-bold text-xl">
                        Lesson Complete! 🎉
                    </p>
                )}
            </div>
        </>
    );
}

export default Practise;