import { useMemo } from "react";
import { useParams } from "react-router-dom";

const MAX_LESSONS = 100;

function getLessonContent(lessonNumber) {
    return {
        title: `Lesson ${lessonNumber}`,
        text: `This is the typing content for lesson ${lessonNumber}. Replace this text with your real lesson paragraph from your data source or API.`,
    };
}

function Practise() {
    const { lessonNumber } = useParams();

    const parsedLessonNumber = Number(lessonNumber);
    const isValidLesson =
        Number.isInteger(parsedLessonNumber) &&
        parsedLessonNumber >= 1 &&
        parsedLessonNumber <= MAX_LESSONS;

    const lessonContent = useMemo(() => {
        if (!isValidLesson) return null;
        return getLessonContent(parsedLessonNumber);
    }, [isValidLesson, parsedLessonNumber]);

    if (!isValidLesson) {
        return (
            <section className="container mx-auto mt-10 rounded-2xl bg-panel p-6 text-center">
                <h2 className="text-2xl font-bold text-brand-heading">Invalid Lesson</h2>
                <p className="mt-2 paragraph-muted-md">
                    This lesson isn't available.
                </p>
            </section>
        );
    }

    return (
        <section className="container mx-auto mt-10 rounded-2xl bg-panel p-6">
            <h2 className="text-2xl font-bold text-brand-heading">{lessonContent.title}</h2>
            <p className="mt-4 text-lg leading-relaxed text-brand-muted">{lessonContent.text}</p>
        </section>
    );
}

export default Practise;