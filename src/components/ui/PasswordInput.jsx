import { useState } from "react"
import passwordicon from "../../assets/images/passwordicon.png"

function PasswordInput({ id, name, value, onChange, onBlur, placeholder = "Enter password" }) {
    const [show, setShow] = useState(false)

    return (
        <div className="field relative text-slate-900 dark:text-white/35">
            <img src={passwordicon} alt="password icon" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-75" />
            <input
                id={id}
                name={name}
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                className="h-13 w-full rounded-xl border border-white/4 bg-panel px-4 pl-11 pr-11 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-500 dark:placeholder:text-slate-300 focus:border-white/10 focus:bg-[#232933]"
            />
            <button
                type="button"
                onClick={() => setShow((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-900 dark:text-white/55 transition hover:text-vibrant-mint-green"
                aria-label={show ? "Hide password" : "Show password"}
            >
                <i className={`fa-solid ${show ? "fa-eye" : "fa-eye-slash"} h-4 w-4`} />
            </button>
        </div>
    )
}

export default PasswordInput
