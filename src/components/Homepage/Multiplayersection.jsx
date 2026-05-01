import multiplayerArenaImage from "../../assets/images/Multiplayer arena.png"
import multiplayerIcon from "../../assets/images/multiplayer icon.png"
import overlay from "../../assets/images/Overlay.png"
import { Link }  from "react-router-dom";
import arrow from "../../assets/images/arrow.png"
import a from "../../assets/images/A.png"
import hash from "../../assets/images/hash.png"

function Multiplayer() {
    return ( <>
       <section className="container mx-auto grid grid-cols-1 gap-6 px-4 my-10 md:grid-cols-12">

            <div className="left md:col-span-8">
                <div className="relative overflow-hidden rounded-xl flex items-center justify-items-center h-56 sm:h-72 md:h-96">
                    <img src={multiplayerArenaImage} className="w-full h-full block rounded-3xl brightness-50 object-cover" alt="Multipayer image" />
                    <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
                    <div className="absolute lg:left-5 lg:top-30 sm:top-20 left-5 top-5 flex flex-col gap-4 rounded-lg p-4">
                        <img src={multiplayerIcon} alt="Multiplayer icon" className="h-4 w-9" />
                        <h1 className="text-3xl font-extrabold text-white">Challenge Your Friends</h1>
                        <p className="max-w-xl text-base text-slate-200">Want to test your skills? Why don&apos;t you challenge your friends in a 1v1 game</p>
                    </div>
                </div>
            </div>
            <div className="right  flex items-center justify-center rounded-xl border bg-panel p-6 text-center md:col-span-4">
                <div className="flex flex-col items-start gap-6 text-left">
                    <img src={overlay} alt="Overlay " />
                    <h2 className="h2-title">Level Progression</h2>
                    <p className="paragraph-muted-sm">Challenge Your Friends To Gain More Level Points</p>
                    <div className="progress flex w-full flex-col items-center justify-center gap-4">
                    <div className="line relative h-2 w-full rounded-full bg-amber-400 ">
                        <div className="absolute left-0 top-0 h-full bg-green-500 rounded-full transition-all duration-300 w-[48%]" >

                        </div>
                    </div>
                    <div className=" w-full justify-between flex ">
                    <h3 className="text-base font-bold text-brand-heading ">Level 48</h3>
                    <h3 className="text-sm font-medium text-brand-muted ">Pro Level</h3>
                    </div>
                    </div>
                   
                </div>
            </div>

            <div className="bottom  bg-dark-gray grid w-full  items-center rounded-xl min-h-96 grid-cols-1 gap-6 px-6 py-10 md:col-span-12 md:grid-cols-12">
                <div className="text col-span-12 flex flex-col gap-6 mx-6 md:col-span-8">
              <h2 className="h2-title-lg">Precision Architectured lessons</h2>
              <p className="paragraph-muted-md max-w-md">Our curriculum isn't just about speed. We focus on muscle memory, ergonomic flow, and character frequency analysis to build a foundation that lasts.</p>
                       <Link to="/" className="text-link flex items-center gap-2 ">Browse Syllabus <img src={arrow} alt="" /></Link>
                </div>
                <div className="squares col-span-12 flex items-center justify-center gap-4 md:col-span-4">
                    <div className=" bg-light-gray  aspect-square min-h-32 min-w-23 flex flex-col items-center justify-center gap-3  "> 
                        <img src={a} alt="Home image" className="scale-[1.2]" />
                        <p className="paragraph-muted-md">Home row</p>
                    </div>
                    <div className=" bg-light-gray min-h-32    aspect-square min-w-23 flex flex-col items-center justify-center gap-3  "> 
                        
                        <img src={hash} alt="Home image" className="scale-[1.2]" />
                        <p className="paragraph-muted-md">Symbols</p>
                        
                    </div>
                </div>
            </div>
            
            
       </section>

    </> );
}

export default Multiplayer; 