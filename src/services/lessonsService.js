
import lessons from '../data/lessons.json';

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
