import keyboardImage from "../../assets/images/Professional mechanical keyboard.png"


function Hero() {
    return ( <>
    <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-10 text-center text-white sm:px-6 md:pt-14">
                <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">Type Faster.</h1>
                <h1 className="mt-1 text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
                    Challenge your friends. <span className="text-emerald-400">|</span>
                </h1>
                <p className="mx-auto mt-4 max-w-2xl paragraph-muted-responsive">Experience the ultimate typing experience right now</p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                    <button className="rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950">Start Typing</button>
                    <button className="rounded-xl border border-blue-400 px-5 py-3 font-semibold text-blue-300">See Stats</button>
                </div>

                <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-left">
                        <i className="fa-solid fa-chart-line text-2xl text-emerald-400"></i>
                        <h3 className="mt-3 text-lg font-semibold">Speed Tracking</h3>
                        <p className="mt-1 paragraph-muted-sm">Track your WPM and accuracy in real time</p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-left">
                        <i className="fa-solid fa-graduation-cap text-2xl text-slate-300"></i>
                        <h3 className="mt-3 text-lg font-semibold">Structured Lessons</h3>
                        <p className="mt-1 paragraph-muted-sm">Progressive training from basics to advanced</p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-left">
                        <i className="fa-solid fa-trophy text-2xl text-yellow-400"></i>
                        <h3 className="mt-3 text-lg font-semibold">Leaderboards</h3>
                        <p className="mt-1 paragraph-muted-sm">Compete globally and with friends</p>
                    </div>
                </div>
                <div className="keyboard mx-auto mt-20 flex flex-col items-center justify-center gap-5 lg:flex-row">
                    <img src={keyboardImage} alt="Keyboard image" className=" w-full max-w-md" />
                     <h2 className="max-w-2xl h2-display">
                        Master touch typing and free your mind from the keyboard. Let your fingers do the thinking while your eyes stay focused on what matters. Transform typing from a conscious struggle into an unconscious skill just like playing an instrument
                     </h2>
                </div>
            </section>
    </> );
}

export default Hero;
