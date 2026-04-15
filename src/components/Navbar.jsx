import { useState } from "react"
import { NavLink } from "react-router-dom"

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const navItems = [
        { to: "/", label: "Home" },
        { to: "/plans", label: "Lessons" },
        { to: "/contact", label: "Contact us" },
        { to: "/challenge", label: "1v1 Challenge" },
        { to: "/stats", label: "Stats" },
    ]

    const linkClass = ({ isActive }) =>
        `transition-colors hover:text-emerald-300 ${isActive ? "text-emerald-400" : "text-slate-100"}`

    return (
        <header className="border-b border-slate-700/70 bg-slate-950/85 backdrop-blur">
            <nav className="mx-auto w-full max-w-6xl px-4 py-4 text-white sm:px-6">
                <div className="grid items-center gap-4 md:grid-cols-[auto_1fr_auto]">
                    <div className="flex items-center gap-3">
                    <i className="fa-solid fa-keyboard text-xl text-emerald-400"></i>
                    <h2 className="text-lg font-semibold tracking-tight sm:text-xl">TypeRush</h2>
                    <button
                        type="button"
                        className="ml-auto rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 md:hidden"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? "Close" : "Menu"}
                    </button>
                </div>

                <div className="hidden items-center justify-center gap-6 text-sm font-medium md:flex md:text-base">
                    {navItems.map((item) => (
                        <NavLink key={item.to} className={linkClass} to={item.to} onClick={() => setMenuOpen(false)}>
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                <div className="hidden items-center justify-end gap-4 md:flex">
                    <button type="button" className="text-slate-200 transition-colors hover:text-emerald-300" aria-label="Toggle dark mode">
                        <i className="fa-solid fa-moon text-xl"></i>
                    </button>
                    <NavLink
                        to="/"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex w-fit rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950 transition-transform hover:scale-105"
                    >
                        Register
                    </NavLink>
                </div>
                </div>

                <div className={`${menuOpen ? "mt-4 flex" : "hidden"} flex-col gap-4 border-t border-slate-800 pt-4 text-sm font-medium md:hidden`}>
                    {navItems.map((item) => (
                        <NavLink key={item.to} className={linkClass} to={item.to} onClick={() => setMenuOpen(false)}>
                            {item.label}
                        </NavLink>
                    ))}
                    <div className="mt-1 flex items-center gap-4">
                        <button type="button" className="text-slate-200 transition-colors hover:text-emerald-300" aria-label="Toggle dark mode">
                            <i className="fa-solid fa-moon text-xl"></i>
                        </button>
                        <NavLink
                            to="/"
                            onClick={() => setMenuOpen(false)}
                            className="inline-flex w-fit rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950 transition-transform hover:scale-105"
                        >
                            Register
                        </NavLink>
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Navbar

