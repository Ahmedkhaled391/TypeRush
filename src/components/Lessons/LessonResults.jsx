import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBestStars } from "../../services/lessonsService";

function calcStars(wpm, accuracy, wpmReq, accReq) {
    if (wpm < wpmReq || accuracy < accReq) return 0;

    const wpmRatio = wpm / wpmReq;
    const accRatio = accuracy / accReq;
    const avg = (wpmRatio + accRatio) / 2;

    if (avg >= 1.4) return 3;
    if (avg >= 1.2) return 2;
    return 1;
}

function CircularGauge({ value, max = 100, color, size = 160, label, subLabel, animate }) {
    const R = 54;
    const circumference = 2 * Math.PI * R;
    const ratio = Math.min(1, Math.max(0, value / max));
    const offset = animate ? circumference * (1 - ratio) : circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r={R} fill="none" stroke="#1c2028" strokeWidth="10" />
                    <circle
                        cx="60"
                        cy="60"
                        r={R}
                        fill="none"
                        stroke={color}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        transform="rotate(-90 60 60)"
                        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{value}</span>
                    {subLabel && <span className="text-xs text-slate-400">{subLabel}</span>}
                </div>
            </div>
            <span className="text-sm text-slate-400 tracking-widest uppercase">{label}</span>
        </div>
    );
}

function Star({ earned, delay }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <svg
            viewBox="0 0 24 24"
            style={{
                width: 52,
                height: 52,
                transform: visible ? "scale(1) rotate(0deg)" : "scale(0) rotate(-30deg)",
                opacity: visible ? 1 : 0,
                transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
                filter: earned ? "drop-shadow(0 0 6px #f5a62388)" : "none",
            }}
        >
            <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={earned ? "#f5a623" : "#2a2f3a"}
                stroke={earned ? "#e09000" : "#3a3f4a"}
                strokeWidth="1"
            />
        </svg>
    );
}

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function LessonResults({
    lessonNumber,
    wpm,
    accuracy,
    elapsedMs,
    wpmRequirement,
    accuracyRequirement,
    onRetry,
    stars: providedStars,
    passed: providedPassed,
    prevBestBeforeAttempt = 0,
}) {
    const navigate = useNavigate();
    const stars = Number.isFinite(providedStars) && providedStars > 0
        ? providedStars
        : calcStars(wpm, accuracy, wpmRequirement, accuracyRequirement);
    const passed = typeof providedPassed === "boolean" ? providedPassed : stars > 0;
    const isLast = lessonNumber >= 100;
    const duration = formatDuration(elapsedMs);

    const prevBest = Math.max(prevBestBeforeAttempt, getBestStars(lessonNumber));
    const isNewBest = stars > prevBestBeforeAttempt;

    const [panelVisible, setPanelVisible] = useState(false);
    const [gaugesAnimate, setGaugesAnimate] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setPanelVisible(true), 50);
        const t2 = setTimeout(() => setGaugesAnimate(true), 450);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    const starLabels = ["", "Keep at it!", "Good Job!", "Excellent!"];
    const failReasons = [];

    if (!passed) {
        if (wpm < wpmRequirement) failReasons.push(`Speed: ${wpm} wpm (need ${wpmRequirement})`);
        if (accuracy < accuracyRequirement) failReasons.push(`Accuracy: ${accuracy}% (need ${accuracyRequirement}%)`);
    }

    return (
        <div
            className="container mx-auto mt-10 mb-16 rounded-2xl bg-panel p-8 md:p-12"
            style={{
                opacity: panelVisible ? 1 : 0,
                transform: panelVisible ? "translateY(0)" : "translateY(28px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
        >
            <div className="flex justify-center gap-3 mb-3">
                {[1, 2, 3].map((n) => (
                    <Star key={n} earned={n <= stars} delay={300 + n * 180} />
                ))}
            </div>

            <p className="text-center text-slate-400 text-sm mb-1 h-5">
                {stars > 0 ? starLabels[stars] : ""}
            </p>

            {isNewBest && stars > 0 ? (
                <p className="text-center text-xs font-bold text-amber-400 tracking-widest uppercase mb-4">
                    ★ New Best Score
                </p>
            ) : (
                <div className="mb-4" />
            )}

            {passed ? (
                <p className="text-center text-xl font-bold mb-10 text-vibrant-mint-green">
                    {isLast ? "You are a TypeRush Master!" : "Lesson Passed! Next lesson unlocked."}
                </p>
            ) : (
                <div className="mb-10 text-center">
                    <p className="text-2xl font-extrabold text-rose-400 mb-2">Lesson Failed</p>
                    <p className="text-slate-400 text-sm mb-3">You didn&apos;t meet the requirements to pass this lesson.</p>
                    <div className="inline-flex flex-col gap-1">
                        {failReasons.map((reason) => (
                            <span key={reason} className="text-xs bg-rose-900/40 border border-rose-700 text-rose-300 rounded-lg px-3 py-1">
                                ✗ {reason}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                <div className="flex flex-col items-center gap-2">
                    <CircularGauge
                        value={accuracy}
                        max={100}
                        color={accuracy >= accuracyRequirement ? "#f5a623" : "#e05a5a"}
                        label="accuracy"
                        subLabel={`${accuracyRequirement}% min`}
                        animate={gaugesAnimate}
                    />
                    <span className={`text-xs font-semibold ${accuracy >= accuracyRequirement ? "text-vibrant-mint-green" : "text-rose-400"}`}>
                        Req: {accuracyRequirement}%
                    </span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div
                        className="relative rounded-full flex flex-col items-center justify-center border-4 border-slate-700"
                        style={{ width: 160, height: 160 }}
                    >
                        <span className="text-3xl font-bold text-white">{duration}</span>
                        <span className="text-xs text-slate-400">min : seconds</span>
                    </div>
                    <span className="text-sm text-slate-400 tracking-widest uppercase">duration</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <CircularGauge
                        value={wpm}
                        max={Math.max(wpmRequirement * 2, wpm + 10)}
                        color={wpm >= wpmRequirement ? "#00FC9A" : "#e05a5a"}
                        label="speed"
                        subLabel="wpm"
                        animate={gaugesAnimate}
                    />
                    <span className={`text-xs font-semibold ${wpm >= wpmRequirement ? "text-vibrant-mint-green" : "text-rose-400"}`}>
                        Req: {wpmRequirement} wpm
                    </span>
                </div>
            </div>

            {prevBest > 0 && (
                <p className="text-center text-xs text-slate-500 mt-6">
                    Previous best: {"★".repeat(prevBest)}{"☆".repeat(3 - prevBest)}
                </p>
            )}

            <div className="flex justify-center gap-4 mt-10">
                {passed ? (
                    <>
                        <button onClick={onRetry} className="px-6 py-3 rounded-xl bg-light-gray text-white font-semibold hover:bg-slate-600 transition">
                            Try Again
                        </button>
                        {!isLast && (
                            <button
                                onClick={() => navigate(`/lessons/${lessonNumber + 1}/practise`)}
                                className="px-6 py-3 rounded-xl bg-cta-button border border-vibrant-mint-green text-vibrant-mint-green font-semibold hover:bg-cta-button-hover transition"
                            >
                                Next Lesson →
                            </button>
                        )}
                        <button onClick={() => navigate("/lessons")} className="px-6 py-3 rounded-xl bg-light-gray text-white font-semibold hover:bg-slate-600 transition">
                            All Lessons
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={onRetry} className="px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition">
                            Try Again
                        </button>
                        <button onClick={() => navigate("/lessons")} className="px-6 py-3 rounded-xl bg-light-gray text-white font-semibold hover:bg-slate-600 transition">
                            All Lessons
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default LessonResults;
