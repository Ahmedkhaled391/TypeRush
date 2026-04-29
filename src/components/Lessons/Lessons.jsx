import greencircle from "../../assets/images/ball.png";
import eclipse from "../../assets/images/eclipse.png";
import locked from "../../assets/images/locked.png";
import { useNavigate } from "react-router-dom";

const TOTAL_LESSONS = 100;
const CURRENT_LESSON = 5;

function getLessonStatus(lessonNumber) {
  if (lessonNumber < CURRENT_LESSON) return "completed";
  if (lessonNumber === CURRENT_LESSON) return "in-progress";
  return "locked";
}

function Lessons(){
  const navigate = useNavigate()
  const lessons = []
  for(let i=1;i<=TOTAL_LESSONS;i++){
    lessons.push({
      lessonNumber: i,
      status: getLessonStatus(i)
    })
}
  const statusStyles = {
    completed:
      "bg-cta-button border border-mint-green text-light-mint-green hover:border-vibrant-mint-green",
    "in-progress":
      "bg-cta-ink border-2 border-vibrant-mint-green text-vibrant-mint-green ring-2 ring-vibrant-mint-green/20",
    locked: "bg-dark-gray border border-dark-gray text-slate-gray",
  };


    return ( <>
       <div className="bg-panel container mx-auto rounded-2xl p-5 mt-10">
        <div className="info  flex flex-col md:flex-row  items-center  justify-between gap-4">
          <div className="flex gap-5 ">

          <div className="flex justify-center items-center gap-3">
            <img src={greencircle} alt="green circle" />
            <h3 className="text-md ">completed</h3>
          </div>
          <div className="flex justify-center items-center gap-3" >
            <img src={eclipse} alt="open circle" />
            <h3 className="text-md ">In Progress</h3>
          </div>
          <div className="flex justify-center items-center gap-3">
            <img src={locked} alt="locked" />
            <h3 className="text-md">Locked</h3>
          </div>
          </div>
          <div>
            <button className="p-3 bg-light-gray rounded-2xl self-end">Jump to current </button>
          </div>

        </div>

        <div className="mt-8 grid grid-cols-4 gap-x-4 gap-y-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {lessons.map((lesson) => (
            <button
              key={lesson.lessonNumber}
              type="button"
              onClick={() => {
                if (lesson.status !== "locked") {
                  navigate(`/lessons/${lesson.lessonNumber}/practise`);
                }
              }}
              className={`relative h-15 rounded-full text-sm font-semibold transition ${statusStyles[lesson.status]} ${
                lesson.status === "locked" ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <span className="absolute  top-[0.3rem] -translate-x-1/2 text-lg font-bold leading-none">
                {lesson.lessonNumber}
              </span>

              <span className="absolute  bottom-[0.6rem] -translate-x-1/2 translate-y-1/3">
                {lesson.status === "completed" && (
                  <span className="flex items-center flex-col gap-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-light-mint-green text-[0.7rem] font-black text-cta-ink">
                      ✓
                    </span>
                    <span className="text-[0.55rem] tracking-[-0.03em] text-light-mint-green">★★★</span>
                  </span>
                )}

                {lesson.status === "in-progress" && (
                  <span className="flex items-center justify-center text-sm text-light-mint-green">▷</span>
                )}

                {lesson.status === "locked" && (
                  <img src={locked} alt="locked" className="h-3 w-3 opacity-80" />
                )}
              </span>
            </button>
          ))}
        </div>
       </div>

       
        

     
    
    </> );
}

export default Lessons;