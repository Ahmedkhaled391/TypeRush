function Stats({ title, wpm = 0, accuracy = 100, progress = 0 }) {
    return ( <>
           <header className="stats">
            <h1 className="text-4xl font-bold text-center my-10 text-brand-heading">{title}</h1>
           <div className="container mx-auto flex flex-col md:flex-row items-center justify-evenly gap-4 mt-10">
            <div className="wpm bg-panel flex flex-col items-center w-full p-6 rounded-xl    ">
                <div>
                <p className="paragraph-md mb-2 text-center ">Words Per Minute</p>
                 <span className="text-vibrant-mint-green p-3 text-5xl ">{wpm}</span>WPM
                </div>
            </div>
            <div className="acc bg-panel flex flex-col items-center w-full p-6 rounded-xl    ">
                <div>
                <p className="paragraph-md mb-2 text-center ">Accuracy rate</p>
                 <span className="text-blue-600 p-3 text-5xl ">{accuracy}</span>%
                </div>
            </div>
            <div className="prog bg-panel flex flex-col items-center w-full p-6 rounded-xl    ">
                <div>
                <p className="paragraph-md mb-2 text-center ">Level Progress</p>
                 <span className="text-vibrant-mint-green p-3 text-5xl ">{progress}</span>%
                </div>
            </div>     
           </div>
        </header>
    </> );
}

export default Stats;