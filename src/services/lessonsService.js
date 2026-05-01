
import lessons from "../data/lessons.json";
import { apiRequest, isAuthenticated } from "./authService";

const STORAGE_KEY = "typerush_passed_lessons";
const STARS_KEY = "typerush_stars";

let progressCache = null;

function getPassedSet() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

function savePassedSet(passedSet) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...passedSet]));
}

function getStarsMap() {
    try {
        const raw = localStorage.getItem(STARS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveStarsMap(starsMap) {
    localStorage.setItem(STARS_KEY, JSON.stringify(starsMap));
}

function calculateStars(wpm, accuracy, wpmReq, accReq) {
    if (wpm < wpmReq || accuracy < accReq) return 0;

    const wpmRatio = wpm / wpmReq;
    const accRatio = accuracy / accReq;
    const avg = (wpmRatio + accRatio) / 2;

    if (avg >= 1.4) return 3;
    if (avg >= 1.2) return 2;
    return 1;
}

function buildLocalSnapshot() {
    const passed = getPassedSet();
    const stars = getStarsMap();

    let unlockedUpTo = 1;
    for (let i = 1; i <= lessons.length; i += 1) {
        if (passed.has(i)) {
            unlockedUpTo = i + 1;
        } else {
            break;
        }
    }

    const lessonMeta = {};
    for (let i = 1; i <= lessons.length; i += 1) {
        lessonMeta[i] = {
            passed: passed.has(i),
            bestStars: stars[i] ?? 0,
        };
    }

    return {
        unlockedUpTo: Math.min(unlockedUpTo, lessons.length),
        lessonMeta,
        source: "local",
    };
}

function buildServerSnapshot(data) {
    const lessonMeta = {};
    for (let i = 1; i <= lessons.length; i += 1) {
        lessonMeta[i] = {
            passed: false,
            bestStars: 0,
        };
    }

    for (const lesson of data.lessons || []) {
        lessonMeta[lesson.lessonId] = {
            passed: Boolean(lesson.passed),
            bestStars: lesson.bestStars ?? 0,
        };
    }

    return {
        unlockedUpTo: data.unlockedUpTo ?? 1,
        lessonMeta,
        source: "server",
    };
}

function recalculateUnlockedUpTo(lessonMeta) {
    let unlockedUpTo = 1;
    for (let i = 1; i <= lessons.length; i += 1) {
        if (lessonMeta[i]?.passed) {
            unlockedUpTo = i + 1;
        } else {
            break;
        }
    }
    return Math.min(unlockedUpTo, lessons.length);
}

export async function loadProgressSnapshot(force = false) {
    if (!isAuthenticated()) {
        progressCache = buildLocalSnapshot();
        return progressCache;
    }

    if (!force && progressCache) {
        return progressCache;
    }

    try {
        const response = await apiRequest("/progress", {
            method: "GET",
        });
        progressCache = buildServerSnapshot(response.data || {});
        return progressCache;
    } catch {
        progressCache = buildLocalSnapshot();
        return progressCache;
    }
}

export function getUnlockedUpTo() {
    if (progressCache) {
        return progressCache.unlockedUpTo;
    }
    return buildLocalSnapshot().unlockedUpTo;
}

export function isLessonPassed(lessonId) {
    if (progressCache) {
        return Boolean(progressCache.lessonMeta[lessonId]?.passed);
    }
    return getPassedSet().has(lessonId);
}

export function getPassedCount() {
    if (progressCache) {
        return Object.values(progressCache.lessonMeta).filter((entry) => entry.passed).length;
    }
    return getPassedSet().size;
}

export function getBestStars(lessonId) {
    if (progressCache) {
        return progressCache.lessonMeta[lessonId]?.bestStars ?? 0;
    }

    const stars = getStarsMap();
    return stars[lessonId] ?? 0;
}

export async function submitLessonAttempt({
    lessonId,
    wpm,
    accuracy,
    elapsedMs,
    wpmRequirement,
    accuracyRequirement,
}) {
    if (!isAuthenticated()) {
        const stars = calculateStars(wpm, accuracy, wpmRequirement, accuracyRequirement);
        const passed = stars > 0;

        if (passed) {
            const passedSet = getPassedSet();
            passedSet.add(lessonId);
            savePassedSet(passedSet);
        }

        const starsMap = getStarsMap();
        if (stars > (starsMap[lessonId] ?? 0)) {
            starsMap[lessonId] = stars;
            saveStarsMap(starsMap);
        }

        progressCache = buildLocalSnapshot();

        return { passed, stars, source: "local" };
    }

    const response = await apiRequest("/progress/attempts", {
        method: "POST",
        body: JSON.stringify({
            lessonId,
            wpm,
            accuracy,
            elapsedMs,
            wpmRequirement,
            accuracyRequirement,
        }),
    });

    const result = response?.data || {};
    const stars = result.stars ?? calculateStars(wpm, accuracy, wpmRequirement, accuracyRequirement);
    const passed = Boolean(result.passed);

    if (!progressCache) {
        await loadProgressSnapshot();
    }

    if (progressCache) {
        const current = progressCache.lessonMeta[lessonId] || { passed: false, bestStars: 0 };
        progressCache.lessonMeta[lessonId] = {
            passed: current.passed || passed,
            bestStars: Math.max(current.bestStars ?? 0, stars),
        };
        progressCache.unlockedUpTo = recalculateUnlockedUpTo(progressCache.lessonMeta);
    }

    return { passed, stars, source: "server" };
}

export function getLesson(lessonId) {
    return lessons.find((lesson) => lesson.id === lessonId) || null;
}

export function getAllLessons() {
    return lessons;
}

export function getLessonText(lessonId) {
    const lesson = getLesson(lessonId);
    return lesson ? lesson.text : null;
}

export function getTotalLessons() {
    return lessons.length;
}
