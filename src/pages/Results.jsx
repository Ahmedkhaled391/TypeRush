import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LessonResults from "../components/Lessons/LessonResults";

function Results() {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state) {
        navigate("/lessons");
        return null;
    }

    const { lessonNumber, wpm, accuracy, elapsedMs, wpmRequirement, accuracyRequirement } = state;

    function handleRetry() {
        navigate(`/lessons/${lessonNumber}/practise`);
    }

    return (
        <>
            <Navbar />
            <LessonResults
                lessonNumber={lessonNumber}
                wpm={wpm}
                accuracy={accuracy}
                elapsedMs={elapsedMs}
                wpmRequirement={wpmRequirement}
                accuracyRequirement={accuracyRequirement}
                onRetry={handleRetry}
            />
        </>
    );
}

export default Results;
