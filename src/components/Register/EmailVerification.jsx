import hash from "../../assets/images/hash.png"
import { Link, useLocation, useNavigate } from "react-router-dom"
import ball from "../../assets/images/ball.png"
import { useState } from "react"
import { verifyEmailCode } from "../../services/authService"

function EmailVerification() {
    const { state } = useLocation()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: state?.email || "",
        code: "",
    })
    const [submitError, setSubmitError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    function handleChange(e) {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitError("")

        try {
            setIsSubmitting(true)
            await verifyEmailCode({
                email: formData.email.trim(),
                code: formData.code.trim(),
            })
            navigate("/profile-setup")
        } catch (error) {
            setSubmitError(error.message || "Verification failed. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <div className="grid min-h-dvh place-items-center px-4 py-8 sm:px-6">
                <div className="w-full max-w-md">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col rounded-3xl border border-white/5 bg-light-gray/95 px-6 py-8 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:px-10 sm:py-10"
                    >
                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-4xl font-black tracking-tight text-vibrant-mint-green sm:text-5xl">
                                TypeRush
                            </h1>
                            <p className="paragraph-muted-sm mt-4 text-[0.78rem] font-medium tracking-[0.22em]">
                                EMAIL VERIFICATION CHECKPOINT
                            </p>
                        </div>

                        <div className="mt-9 space-y-5">
                            <div className="name flex flex-col gap-2.5">
                                <label htmlFor="verify-email" className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900 dark:text-white/45">
                                    Email
                                </label>
                                <div className="field relative text-slate-900 dark:text-white/35">
                                    <input id="verify-email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="email@example.com" className="h-13 w-full rounded-xl border border-white/4 bg-panel px-4 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-500 dark:placeholder:text-slate-300 focus:border-white/10 focus:bg-[#232933]" />
                                </div>
                            </div>

                            <div className="name flex flex-col gap-2.5">
                                <label htmlFor="verification-code" className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900 dark:text-white/45">
                                    Verification Code
                                </label>
                                <div className="field relative text-slate-900 dark:text-white/35">
                                    <img src={hash} alt="verification code icon" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-75" />
                                    <input id="verification-code" name="code" value={formData.code} onChange={handleChange} type="text" placeholder="Enter 6-digit code" className="h-13 w-full rounded-xl border border-white/4 bg-panel px-4 pl-11 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-500 dark:placeholder:text-slate-300 focus:border-white/10 focus:bg-[#232933]" />
                                </div>
                            </div>
                        </div>

                        <p className="paragraph-muted-sm mt-7 text-center text-sm">
                            After registration, we sent a 6-digit code to your email.
                        </p>

                        <div className="mt-8 text-center">
                            {submitError && <p className="mb-3 text-xs font-semibold text-red-400">{submitError}</p>}
                            <button disabled={isSubmitting} className="w-full rounded-2xl bg-linear-to-r from-light-mint-green to-vibrant-mint-green p-4 text-base font-black tracking-tight text-dark-mint-green shadow-[0_16px_35px_rgba(0,252,154,0.24)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
                                {isSubmitting ? "VERIFYING..." : "VERIFY CODE"}
                            </button>

                            <p className="paragraph-muted-sm mt-10 text-base">
                                Back to
                                <Link to="/register" className="mx-1 font-semibold text-vibrant-mint-green">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>

                    <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-slate-900 dark:text-white/25">
                        <span className="flex items-center gap-2">
                            <img src={ball} alt="" aria-hidden="true" className="h-2 w-2" />
                            Secure Encryption
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                            Global Sync
                        </span>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EmailVerification
