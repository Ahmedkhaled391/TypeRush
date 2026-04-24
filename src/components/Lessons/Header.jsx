function Header() {
    return ( <>
      <header className="flex items-center flex-col md:flex-row justify-around gap-4 mt-10 mx-auto px-4  w-full">
        <div className="text flex flex-col text-center gap-2">
       <div className="text-4xl">Curriculum <span className="text-light-mint-green text-4xl">Map.</span></div>
        <p className="paragraph-muted-md max-w-md ">100 sequential modules designed for total mastery. Track you progress from basic home row to high-verlocity tehnical editor</p>

        </div>
        <div className="modules bg-panel flex items-center flex-col p-4 ">
            <h1 className=" pargraph-muted-lg ">Modules Complete</h1>
            <div className="progress paragraph-muted-sm mt-1 ">
                <span className="text-vibrant-mint-green p-3 text-3xl">42</span>/100
            </div>

        </div>
      </header>
       
    </> );
}

export default Header;