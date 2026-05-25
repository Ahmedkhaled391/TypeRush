import { useRef, useState } from "react"
import copyIcon from "../../assets/images/copyIcon.png"
import arenaIcon from "../../assets/images/arenaIcon.png"
import { useNavigate } from "react-router-dom"
import { getCachedUser } from "../../services/authService"
import { getAllLessons } from "../../services/lessonsService"
import { createMatch, joinMatch } from "../../services/matchService"


function generateMatchCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function copyTextToClipboard(text) {
  if (!navigator?.clipboard?.writeText) {
    return false
  }

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function Multiplayer() {
    const navigate = useNavigate()
    const lessons = getAllLessons()
    const [hostCode, setHostCode] = useState(() => generateMatchCode())
    const [selectedLessonId, setSelectedLessonId] = useState(1)
    const [joinCode, setJoinCode] = useState(Array(6).fill(""))
    const [copyLabel, setCopyLabel] = useState("Copy & Start")
    const [joinLabel, setJoinLabel] = useState("Join The Arena")
    const [error, setError] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [isJoining, setIsJoining] = useState(false)
    const inputRefs = useRef([])
    const formattedHostCode = `${hostCode.slice(0, 3)} ${hostCode.slice(3)}`

    const handleCreateMatch = async () => {
      if (isCreating) return

      setIsCreating(true)
      setError("")
      setCopyLabel("Creating")

      try {
        const match = await createMatch({
          lessonId: Number(selectedLessonId),
          code: hostCode,
        })
        setHostCode(match.code)
        const copied = await copyTextToClipboard(match.code)
        setCopyLabel(copied ? "Copied" : "Starting")
        navigate(`/match/${match.code}`)
      } catch (err) {
        setError(err.message || "Unable to create a match.")
        if (err.status === 409) {
          setHostCode(generateMatchCode())
        }
        setCopyLabel("Try Again")
      } finally {
        setIsCreating(false)
      }
    }

    const handleDigitChange = (index, value) => {
      const lastChar = value.slice(-1)

      if (lastChar && !/^[0-9]$/.test(lastChar)) {
        return
      }

      const nextCode = [...joinCode]
      nextCode[index] = lastChar || ""
      setJoinCode(nextCode)

      if (lastChar && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    const handleDigitKeyDown = (index, e) => {
      if (e.key === "Backspace" && !joinCode[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }

      if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }

      if (e.key === "ArrowRight" && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    const handleCodePaste = (e) => {
      e.preventDefault()
      const pastedDigits = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6)
        .split("")

      if (!pastedDigits.length) {
        return
      }

      const nextCode = Array(6).fill("")
      pastedDigits.forEach((digit, index) => {
        nextCode[index]=digit
      })

      setJoinCode(nextCode)
      const lastIndex = Math.min(pastedDigits.length - 1, 5)
      inputRefs.current[lastIndex]?.focus()
    }

    const handleJoinMatch = async () => {
      if (isJoining) return

      const code = joinCode.join("")
      if (code.length !== 6) {
        setError("Enter the full 6-digit match code.")
        return
      }

      setIsJoining(true)
      setError("")
      setJoinLabel("Joining")

      try {
        const user = getCachedUser()
        const match = await joinMatch({
          code,
          username: user?.username || "Player",
        })
        navigate(`/match/${match.code}`)
      } catch (err) {
        setError(err.message || "Unable to join this match.")
        setJoinLabel("Try Again")
      } finally {
        setIsJoining(false)
        setTimeout(() => {
          setJoinLabel("Join The Arena")
        }, 1500)
      }
    }

    return ( <>
      <div className="mx-auto flex min-h-[calc(100dvh-100px)] max-w-7xl flex-col items-center justify-between gap-16 px-6 py-12 sm:px-10 lg:flex-row lg:px-20 xl:px-28">
        <div className="left flex w-full max-w-md flex-col items-start justify-center gap-5">
            <h3 className="text-sm uppercase tracking-[0.2em] text-vibrant-mint-green">Initiate Battle</h3>
            <h1 className="text-5xl font-semibold tracking-tight text-brand-heading">Host a Match</h1>
            <p className="paragraph-muted-sm max-w-[42ch] leading-7">Create a private arena and invite your rival. Performance speed is synchronized in real-time.</p>
            <div className="mt-4 w-full rounded-2xl border border-white/10 bg-linear-to-b from-dark-gray to-dark-navy-gray p-8 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
              <label htmlFor="match-lesson" className="text-[0.68rem] uppercase tracking-[0.25em] text-brand-muted">
                Lesson
              </label>
              <select
                id="match-lesson"
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-panel px-4 py-3 text-brand-heading outline-none focus:border-emerald-400"
              >
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
              <p className="mt-8 text-center text-[0.68rem] uppercase tracking-[0.25em] text-brand-muted">Access Code</p>
              <div
                className={[
                  "code py-5 text-center font-bold",
                  hostCode
                    ? "text-6xl tracking-[0.12em] text-vibrant-mint-green"
                    : "text-4xl tracking-[0.1em] text-brand-muted",
                ].join(" ")}
              >
                {formattedHostCode}
              </div>
              <button
                type="button"
                onClick={handleCreateMatch}
                disabled={isCreating}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-linear-to-r from-light-mint-green to-vibrant-mint-green p-4 text-base font-extrabold tracking-tight text-dark-mint-green transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <img src={copyIcon} alt="copy icon" className="h-4 w-4 mr-2" />
                {copyLabel}
              </button>

            </div>
        </div>
        <div className="right flex w-full max-w-md flex-col items-start justify-center gap-5  ">
            <h3 className="text-sm uppercase tracking-[0.2em] text-blue-500">Enter Combat</h3>
            <h1 className="text-5xl font-semibold tracking-tight text-brand-heading">Join a Match</h1>
            <p className="paragraph-muted-sm max-w-[42ch] leading-7">Enter the 6-digit transmittion code provided by your host to secure your slot in the lobby.</p>
            <div className="mt-4 w-full rounded-2xl border border-white/10 bg-linear-to-b from-dark-gray to-dark-navy-gray p-8 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
              <p className="text-center text-[0.68rem] uppercase tracking-[0.25em] text-brand-muted mb-2">Enter Code</p>
              <div className="code py-3 text-center font-bold text-slate-900 dark:text-white">
                <div onPaste={handleCodePaste} className="flex items-center justify-center gap-4 bg-light-gray py-5 px-5">
                  {joinCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      placeholder="0"
                      className="w-6 border-0 border-b-2 border-gray-500 bg-transparent text-center text-3xl font-semibold text-gray-500 placeholder:text-gray-500 focus:border-white focus:outline-none"
                      aria-label={`Code digit ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleJoinMatch}
                disabled={isJoining}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-panel text-slate-900 dark:text-white p-4 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <img src={arenaIcon} alt="copy icon" className="h-4 w-4 mx-2" />
                {joinLabel}
              </button>

            </div>
        </div>

      </div>
      {error && (
        <p className="mx-auto mt-4 max-w-xl rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-300">
          {error}
        </p>
      )}
    </> );
}

export default Multiplayer;
