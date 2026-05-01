import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("typerush_theme") || "light"
    })

    useEffect(() => {
        const root = document.documentElement
        root.classList.toggle("dark", theme === "dark")
        localStorage.setItem("typerush_theme", theme)
    }, [theme])

    function toggleTheme() {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"))
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
    return ctx
}
