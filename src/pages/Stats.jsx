import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LessonStats from "../components/Lessons/Stats";
import { apiRequest } from "../services/authService";
import { getTotalLessons, loadProgressSnapshot } from "../services/lessonsService";

function Stats() {
    const [summary, setSummary] = useState({
        attemptsCount: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        bestWpm: 0,
        bestAccuracy: 0,
        passedCount: 0,
    });
    const [recentAttempts, setRecentAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadStats() {
            setLoading(true);

            try {
                const [summaryResponse, attemptsResponse, progressSnapshot] = await Promise.all([
                    apiRequest("/progress/stats", { method: "GET" }),
                    apiRequest("/progress/attempts/recent", { method: "GET" }),
                    loadProgressSnapshot(true),
                ]);

                if (!isMounted) return;

                const summaryData = summaryResponse?.data || {};
                const passedLessons = progressSnapshot
                    ? Object.values(progressSnapshot.lessonMeta || {}).filter((entry) => entry.passed).length
                    : 0;

                setSummary({
                    attemptsCount: summaryData.attemptsCount ?? 0,
                    avgWpm: summaryData.avgWpm ?? 0,
                    avgAccuracy: summaryData.avgAccuracy ?? 0,
                    bestWpm: summaryData.bestWpm ?? 0,
                    bestAccuracy: summaryData.bestAccuracy ?? 0,
                    passedCount: passedLessons,
                });
                setRecentAttempts(Array.isArray(attemptsResponse?.data) ? attemptsResponse.data : []);
            } catch {
                if (!isMounted) return;
                setSummary({
                    attemptsCount: 0,
                    avgWpm: 0,
                    avgAccuracy: 0,
                    bestWpm: 0,
                    bestAccuracy: 0,
                    passedCount: 0,
                });
                setRecentAttempts([]);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadStats();

        return () => {
            isMounted = false;
        };
    }, []);

    const progressPercentage = useMemo(() => {
        const total = getTotalLessons();
        if (!total) return 0;
        return Math.round((summary.passedCount / total) * 100);
    }, [summary.passedCount]);

    return (
        <>
            <Navbar />

            <main className="mx-auto w-full max-w-6xl px-4 py-8 text-slate-900 dark:text-white sm:px-6 lg:py-10">
                <section className="rounded-2xl bg-panel p-6 md:p-8">
                    <h1 className="text-3xl font-bold text-brand-heading sm:text-4xl">Your Stats</h1>
                    <p className="mt-2 paragraph-muted-responsive">Track your typing performance across lessons.</p>

                    {loading ? (
                        <p className="mt-8 paragraph-muted-sm">Loading stats...</p>
                    ) : (
                        <LessonStats
                            title="Performance Overview"
                            wpm={summary.avgWpm}
                            accuracy={summary.avgAccuracy}
                            progress={progressPercentage}
                        />
                    )}
                </section>

                <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <article className="rounded-xl bg-panel p-5">
                        <p className="paragraph-muted-sm">Total Attempts</p>
                        <p className="mt-2 text-3xl font-bold text-brand-heading">{summary.attemptsCount}</p>
                    </article>
                    <article className="rounded-xl bg-panel p-5">
                        <p className="paragraph-muted-sm">Best WPM</p>
                        <p className="mt-2 text-3xl font-bold text-vibrant-mint-green">{summary.bestWpm}</p>
                    </article>
                    <article className="rounded-xl bg-panel p-5">
                        <p className="paragraph-muted-sm">Best Accuracy</p>
                        <p className="mt-2 text-3xl font-bold text-blue-600">{summary.bestAccuracy}%</p>
                    </article>
                </section>

                <section className="mt-6 rounded-2xl bg-panel p-6">
                    <h2 className="text-xl font-semibold text-brand-heading">Recent Attempts</h2>

                    {!recentAttempts.length ? (
                        <p className="mt-4 paragraph-muted-sm">No attempts yet. Complete a lesson to start building your stats.</p>
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-130 text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-300/70 dark:border-slate-700/70">
                                        <th className="px-3 py-2 font-semibold">Lesson</th>
                                        <th className="px-3 py-2 font-semibold">WPM</th>
                                        <th className="px-3 py-2 font-semibold">Accuracy</th>
                                        <th className="px-3 py-2 font-semibold">Stars</th>
                                        <th className="px-3 py-2 font-semibold">Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentAttempts.map((attempt) => (
                                        <tr key={attempt._id || `${attempt.lessonId}-${attempt.createdAt}`} className="border-b border-slate-200/70 dark:border-slate-800/70">
                                            <td className="px-3 py-2">{attempt.lessonId}</td>
                                            <td className="px-3 py-2">{attempt.wpm}</td>
                                            <td className="px-3 py-2">{attempt.accuracy}%</td>
                                            <td className="px-3 py-2 text-yellow-400">{"★".repeat(attempt.stars || 0)}{"☆".repeat(3 - (attempt.stars || 0))}</td>
                                            <td className={`px-3 py-2 font-semibold ${attempt.passed ? "text-emerald-500" : "text-rose-500"}`}>
                                                {attempt.passed ? "Passed" : "Failed"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </>
    );
}

export default Stats;