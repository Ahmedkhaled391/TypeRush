function Stats({ title, wpm = 0, accuracy = 100, progress = 0, compact = false }) {
    const titleClass = compact
        ? "text-2xl font-bold text-center my-4 text-brand-heading"
        : "text-4xl font-bold text-center my-10 text-brand-heading";
    const wrapClass = compact
        ? "mx-auto grid w-full grid-cols-1 gap-3 sm:grid-cols-3"
        : "container mx-auto flex flex-col md:flex-row items-center justify-evenly gap-4 mt-10";
    const cardClass = compact
        ? "bg-panel flex flex-col items-center w-full p-3 rounded-xl"
        : "bg-panel flex flex-col items-center w-full p-6 rounded-xl";
    const valueClass = compact ? "p-1 text-3xl" : "p-3 text-5xl";

    return ( <>
           <header className="stats">
            {title ? <h1 className={titleClass}>{title}</h1> : null}
           <div className={wrapClass}>
            <div className={`wpm ${cardClass}`}>
                <div>
                <p className="paragraph-md mb-2 text-center ">Words Per Minute</p>
                 <span className={`text-vibrant-mint-green ${valueClass}`}>{wpm}</span>WPM
                </div>
            </div>
            <div className={`acc ${cardClass}`}>
                <div>
                <p className="paragraph-md mb-2 text-center ">Accuracy rate</p>
                 <span className={`text-blue-600 ${valueClass}`}>{accuracy}</span>%
                </div>
            </div>
            <div className={`prog ${cardClass}`}>
                <div>
                <p className="paragraph-md mb-2 text-center ">Level Progress</p>
                 <span className={`text-vibrant-mint-green ${valueClass}`}>{progress}</span>%
                </div>
            </div>     
           </div>
        </header>
    </> );
}

export default Stats;
