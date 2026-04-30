
import lessons from '../data/lessons.json';

const STORAGE_KEY = 'typerush_passed_lessons';

/** Returns the Set of passed lesson IDs stored in localStorage */
function getPassedSet() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

/** Saves a lesson as passed and unlocks the next one */
export function markLessonPassed(lessonId) {
    const passed = getPassedSet();
    passed.add(lessonId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...passed]));
}

/**
 * Returns the highest lesson number the user can access.
 * Lesson 1 is always unlocked. Each subsequent lesson is unlocked
 * when the previous one has been passed.
 */
export function getUnlockedUpTo() {
    const passed = getPassedSet();
    let max = 1;
    for (let i = 1; i <= lessons.length; i++) {
        if (passed.has(i)) {
            max = i + 1; // unlocks next
        } else {
            break;
        }
    }
    return Math.min(max, lessons.length);
}

export function isLessonPassed(lessonId) {
    return getPassedSet().has(lessonId);
}

export function getPassedCount() {
    return getPassedSet().size;
}

const STARS_KEY = "typerush_stars";

export function getBestStars(lessonId) {
    try {
        const raw = localStorage.getItem(STARS_KEY);
        const map = raw ? JSON.parse(raw) : {};
        return map[lessonId] ?? 0;
    } catch {
        return 0;
    }
}

export function getLesson(lessonId) {
    return lessons.find(lesson => lesson.id === lessonId) || null;
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
