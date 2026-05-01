import { NavLink } from "react-router-dom"
import ball from "../assets/images/ball.png"

function Footer() {
    return (
        <footer className="min-h-92 bg-slate-100 dark:bg-black px-6 py-8 text-center text-slate-900 dark:text-white lg:text-left">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-8 lg:flex-row lg:items-start">
                
                <div className="mx-5 flex flex-col items-center gap-5 lg:items-start">
                    <h1 className="text-emerald-500 text-3xl font-bold">
                        TypeRush
                    </h1>
                    
                    <p className="paragraph-muted-sm max-w-sm md:line-clamp-no-ellipsis">
                        &copy; 2024 TypeRush. The typing experience, solo practise and 1v1 challenges, All rights reserved.
                    </p>
                    
                    <div className="links flex gap-5">
                        <a href="https://www.linkedin.com/in/ahmed-khaled-7835b9331" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                            <i className="fa-brands fa-linkedin text-2xl hover:text-cyan-500 transition-colors"></i>
                        </a>
                        <a href="https://www.instagram.com/ahmedkhaled39119/" target="_blank" rel="noreferrer" aria-label="Instagram">
                            <i className="fa-brands fa-instagram text-2xl hover:text-pink-500 transition-colors"></i>
                        </a>
                    </div>
                </div>

                
                <div className="headings flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:items-start lg:gap-20 lg:text-left">
                    <div className="flex flex-col items-center gap-3 lg:items-start">
                        <h2 className="text-xl">
                            Platform
                        </h2>
                        <ul className="flex flex-col gap-2">
                            <li><NavLink to="/" className="paragraph-muted-sm transition-colors hover:text-emerald-300">Typing Test</NavLink></li>
                            <li><NavLink to="/plans" className="paragraph-muted-sm transition-colors hover:text-emerald-300">Lesson Catalog</NavLink></li>
                            <li><NavLink to="/challenge" className="paragraph-muted-sm transition-colors hover:text-emerald-300">Multiplayer Arena</NavLink></li>
                            <li><NavLink to="/stats" className="paragraph-muted-sm transition-colors hover:text-emerald-300">Global Leaderboard</NavLink></li>
                        </ul>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3 lg:items-start">
                        <h2 className="text-xl">
                            Support
                        </h2>
                        <ul className="flex flex-col gap-2">
                            <li><NavLink to="/" className="paragraph-muted-sm transition-colors hover:text-emerald-300">Documentation</NavLink></li>
                            <li><NavLink to="/plans" className="paragraph-muted-sm transition-colors hover:text-emerald-300">Privacy Policy</NavLink></li>
                            <li><NavLink to="/challenge" className="paragraph-muted-sm transition-colors hover:text-emerald-300">Terms of Service</NavLink></li>
                            <li><NavLink to="/contact" className="paragraph-muted-sm transition-colors hover:text-emerald-300">Contact</NavLink></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="copyrights mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 pt-10 text-center md:flex-row md:items-center md:text-left">
                <h2>@2026 TYPERUSH ALL RIGHTS RESERVED</h2>
                <div className="flex items-center gap-2 ">
                    <img src={ball} alt="Green ball" />
                    <h2>@2026 SERVER STATUS OPTIMAL</h2>
                </div>
            </div>

            
        </footer>
    );
}

export default Footer;