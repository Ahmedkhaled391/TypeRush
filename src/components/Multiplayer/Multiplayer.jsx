import { useRef, useState } from "react"
import copyIcon from "../../assets/images/copyIcon.png"
import arenaIcon from "../../assets/images/arenaIcon.png"
import { Link } from "react-router-dom"
function Multiplayer() {
    const [joinCode, setJoinCode] = useState(Array(6).fill(""))
    const inputRefs = useRef([])

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

    return ( <>
      <div className="flex lg:flex-row flex-col h-[calc(100dvh-100px)]  items-center justify-around  mx-6 mt-5 gap-10">
        <div className="left flex w-full max-w-md flex-col items-start justify-center gap-5">
            <h3 className="text-sm uppercase tracking-[0.2em] text-vibrant-mint-green">Initiate Battle</h3>
            <h1 className="text-5xl font-semibold tracking-tight text-brand-heading">Host a Match</h1>
            <p className="paragraph-muted-sm max-w-[42ch] leading-7">Create a private arena and invite your rival. Performance speed is synchronized in real-time.</p>
            <div className="w-full rounded-2xl border border-white/10 bg-linear-to-b from-dark-gray to-dark-navy-gray p-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
              <p className="text-center text-[0.68rem] uppercase tracking-[0.25em] text-brand-muted">Access Code</p>
              <div className="code py-3 text-center text-6xl font-bold tracking-[0.12em] text-vibrant-mint-green">
                482 917
              </div>
              <button className="mt-2 flex w-full items-center justify-center rounded-xl bg-linear-to-r from-light-mint-green to-vibrant-mint-green p-4 text-base font-extrabold tracking-tight text-dark-mint-green transition hover:brightness-105">
                <img src={copyIcon} alt="copy icon" className="h-4 w-4 mr-2" />
                Copy & Start
              </button>

            </div>
        </div>
        <div className="right flex w-full max-w-md flex-col items-start justify-center gap-5  ">
            <h3 className="text-sm uppercase tracking-[0.2em] text-blue-500">Enter Combat</h3>
            <h1 className="text-5xl font-semibold tracking-tight text-brand-heading">Join a Match</h1>
            <p className="paragraph-muted-sm max-w-[42ch] leading-7">Enter the 6-digit transmittion code provided by your host to secure your slot in the lobby.</p>
            <div className="w-full rounded-2xl border border-white/10 bg-linear-to-b from-dark-gray to-dark-navy-gray p-6 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
              <p className="text-center text-[0.68rem] uppercase tracking-[0.25em] text-brand-muted mb-2">Enter Code</p>
              <div className="code py-3 text-center font-bold text-white">
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
                <Link to="/lessons">
              <div className="mt-2 flex w-full items-center justify-center rounded-xl bg-panel text-white p-4" >
                <img src={arenaIcon} alt="copy icon" className="h-4 w-4 mx-2" />
                Join The Arena
              </div>
                </Link>

            </div>
        </div>

      </div>
    </> );
}

export default Multiplayer;