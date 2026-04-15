import multiplayerArenaImage from "../../assets/images/Multiplayer arena.png"
import multiplayerIcon from "../../assets/images/multiplayer icon.png"
import overlay from "../../assets/images/Overlay.png"

function Multiplayer() {
    return ( <>
       <section className="container mx-auto grid grid-cols-1 gap-6 px-4 my-10 md:grid-cols-12">

            <div className="left md:col-span-8 ">
                <div className="relative overflow-hidden rounded-xl flex items-center justify-items-center">
            <img src={multiplayerArenaImage} className=" w-full  block max-h-96 rounded-3xl brightness-50 object-fill" alt="Multipayer image" />
            <div className="absolute lg:left-5 lg:top-30 top:20 left-5  flex  flex-col gap-4 rounded-lg p-4  ">
            <img src={multiplayerIcon} alt="Multiplayer icon" className="h-4 w-9" />
                <h1 className="text-3xl font-extrabold text-brand-heading">Challenge Your Friends</h1>
                    <p className="text-brand-muted">Want to test your skills? Why don't you challenge your friends in a 1v1 game</p>
            </div>

                </div>
            </div>
            <div className="right relative flex items-center justify-center rounded-xl border bg-panel p-6 text-center md:col-span-4">
                <div className="absolute left-15  flex max-w-[85%]  flex-col items-start gap-6 text-left">
                    <img src={overlay} alt="Overlay " />
                    <h2 className="text-2xl font-extrabold leading-tight text-brand-heading">Level Progression</h2>
                    <p className="text-sm text-brand-muted">Challenge Your Friends To Gain More Level Points</p>
                    <div className="progress flex w-full flex-col items-center justify-center gap-4">
                    <div className="line  h-2 w-full bg-amber-400 "></div>
                    <div className=" w-full justify-between flex ">
                    <h3 className="text-base font-bold text-brand-heading ">Level 48</h3>
                    <h3 className="text-sm font-medium text-brand-muted ">Pro Tier</h3>
                    </div>
                    </div>
                    {/* haven't fixed reponsiveness yet */}
                </div>
            </div>
            
            
       </section>

    </> );
}

export default Multiplayer;