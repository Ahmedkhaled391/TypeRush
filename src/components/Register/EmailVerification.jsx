import hash from "../../assets/images/hash.png"
import { Link } from "react-router-dom"
import ball from "../../assets/images/ball.png"

function EmailVerification() {
    return (
        <>
            <div className="grid min-h-dvh place-items-center px-4 py-8 sm:px-6">
                <div className="w-full max-w-md">
                    <form
                        action=""
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
                                <label htmlFor="verification-code" className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                                    Verification Code
                                </label>
                                <div className="field relative text-white/35">
                                    <img src={hash} alt="verification code icon" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-75" />
                                    <input id="verification-code" type="text" placeholder="Enter 6-digit code" className="h-13 w-full rounded-xl border border-white/4 bg-panel px-4 pl-11 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/10 focus:bg-[#232933]" />
                                </div>
                            </div>
                        </div>

                        <p className="paragraph-muted-sm mt-7 text-center text-sm">
                            After registration, we sent a 6-digit code to your email.
                        </p>

                        <div className="mt-8 text-center">
                            <button className="w-full rounded-2xl bg-linear-to-r from-light-mint-green to-vibrant-mint-green p-4 text-base font-black tracking-tight text-dark-mint-green shadow-[0_16px_35px_rgba(0,252,154,0.24)] transition-transform duration-200 hover:-translate-y-0.5">
                                VERIFY CODE
                            </button>

                            <p className="paragraph-muted-sm mt-10 text-base">
                                Back to
                                <Link to="/register" className="mx-1 font-semibold text-vibrant-mint-green">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>

                    <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-white/25">
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
