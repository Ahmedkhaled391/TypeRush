import { useEffect, useRef, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { getCachedUser, getCurrentUser, isAuthenticated, logoutUser, subscribeAuthChanges } from "../services/authService"

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState(() => getCachedUser())
    const navigate = useNavigate()
    const profileMenuRef = useRef(null)
    const navItems = [
        { to: "/", label: "Home" },
        { to: "/Lessons", label: "Lessons" },
        { to: "/contact", label: "Contact us" },
        { to: "/challenge", label: "1v1 Challenge" },
        { to: "/stats", label: "Stats" },
    ]

    const linkClass = ({ isActive }) =>
        `transition-colors hover:text-emerald-300 ${isActive ? "text-emerald-400" : "text-slate-100"}`

    useEffect(() => {
        let isMounted = true

        async function loadUser() {
            if (!isAuthenticated()) {
                if (isMounted) setCurrentUser(null)
                return
            }

            try {
                const response = await getCurrentUser()
                if (isMounted) {
                    setCurrentUser(response?.data || null)
                }
            } catch {
                if (isMounted) {
                    setCurrentUser(null)
                }
            }
        }

        loadUser()
        const unsubscribe = subscribeAuthChanges(() => {
            if (!isMounted) return
            const cachedUser = getCachedUser()
            setCurrentUser(cachedUser)
            if (!cachedUser && isAuthenticated()) {
                loadUser()
            }
        })

        return () => {
            unsubscribe()
            isMounted = false
        }
    }, [])

    useEffect(() => {
        function handleOutsideClick(event) {
            if (!profileMenuRef.current) return
            if (!profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false)
            }
        }

        document.addEventListener("mousedown", handleOutsideClick)
        return () => document.removeEventListener("mousedown", handleOutsideClick)
    }, [])

    async function handleLogout() {
        await logoutUser()
        setCurrentUser(null)
        setProfileMenuOpen(false)
        setMenuOpen(false)
        navigate("/register", { replace: true })
    }

    function handleChangePhoto() {
        setProfileMenuOpen(false)
        setMenuOpen(false)
        navigate("/profile-setup")
    }

    const profileImage = currentUser?.profileImage || ""
    const isLoggedIn = Boolean(currentUser?.id || currentUser?._id)

    const profileButton = (
        <div className="relative" ref={profileMenuRef}>
            <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white"
                aria-label="Open profile options"
            >
                {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                    <i className="fa-solid fa-user text-slate-400" aria-hidden="true" />
                )}
            </button>

            {profileMenuOpen && (
                <div className="absolute right-0 z-30 mt-2 w-40 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl">
                    <button
                        type="button"
                        onClick={handleChangePhoto}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800"
                    >
                        Edit Profile
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 transition hover:bg-slate-800"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    )

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
                    {isLoggedIn ? (
                        profileButton
                    ) : (
                        <NavLink
                            to="/register"
                            onClick={() => setMenuOpen(false)}
                            className="inline-flex w-fit rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950 transition-transform hover:scale-105"
                        >
                            Register
                        </NavLink>
                    )}
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
                        {isLoggedIn ? (
                            <button
                                type="button"
                                onClick={handleChangePhoto}
                                className="inline-flex w-fit rounded-lg border border-vibrant-mint-green/50 px-4 py-2 font-semibold text-vibrant-mint-green"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <NavLink
                                to="/register"
                                onClick={() => setMenuOpen(false)}
                                className="inline-flex w-fit rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-slate-950 transition-transform hover:scale-105"
                            >
                                Register
                            </NavLink>
                        )}
                        {isLoggedIn && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex w-fit rounded-lg border border-red-400/50 px-4 py-2 font-semibold text-red-300"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Navbar

