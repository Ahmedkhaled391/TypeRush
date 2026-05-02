import nameicon from "../../assets/images/nameicon.png"
import emailicon from "../../assets/images/emailicon.png"
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ball from "../../assets/images/ball.png"
import { isValidEmail, isValidPass, isValidUsername } from "../../utils/validators";
import { signupUser } from "../../services/authService";
import PasswordInput from "../ui/PasswordInput";

function Signup() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        pass: "",
        confirmPass: "",
    });
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passError, setPassError] = useState("");
    const [confirmPassError, setConfirmPassError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    function getNameError(username) {
        const value = username.trim();

        if (!value) return "Username is required";
        if (!isValidUsername(value)) {
            return "Username must be >2 chars, and has no spaces or symbols except _ )";
        }

        return "";
    }

    function getEmailError(email) {
        const value = email.trim();

        if (!value) return "Email is required";
        if (!isValidEmail(value)) return "Please enter a valid email address";

        return "";
    }

    function getPassError(pass) {
        if (!pass) return "Password is required";
        if (!isValidPass(pass)) {
            return "Password must be at least 8 chars, and contain at least a number or a special character";
        }
        return "";
    }

    function getConfirmPassError(confirmPass) {
        if (!confirmPass) return "Please confirm your password";
        if (confirmPass !== formData.pass) return "Passwords do not match";
        return "";
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "name") setNameError(getNameError(value));
        if (name === "email") setEmailError(getEmailError(value));
        if (name === "pass") setPassError(getPassError(value));
        if (name === "confirmPass") setConfirmPassError(getConfirmPassError(value));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const nameErr = getNameError(formData.name);
        const emailErr = getEmailError(formData.email);
        const passErr = getPassError(formData.pass);
        const confirmPassErr = getConfirmPassError(formData.confirmPass);

        setNameError(nameErr);
        setEmailError(emailErr);
        setPassError(passErr);
        setConfirmPassError(confirmPassErr);
        setSubmitError("");

        if (nameErr || emailErr || passErr || confirmPassErr) return;

        try {
            setIsSubmitting(true);
            await signupUser({
                username: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.pass,
            });
            navigate("/verify-email", { state: { email: formData.email.trim() } });
        } catch (error) {
            setSubmitError(error.message || "Signup failed. Please try again.");
        } finally {
            setIsSubmitting(false);
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
                                JOIN THE PRECISION NETWORK
                            </p>
                        </div>

                        <div className="mt-9 space-y-5">
                            <div className="name flex flex-col gap-2.5">
                                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900 dark:text-white/45">
                                    Username
                                </label>
                                {nameError && <div className="alert-name text-xs font-semibold text-red-400">{nameError}</div>}
                                <div className="field relative text-slate-900 dark:text-white/35">
                                    <img src={nameicon} alt="username icon" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-75" />
                                    <input id="name" name="name" value={formData.name} onChange={handleChange} onBlur={() => setNameError(getNameError(formData.name))} type="text" placeholder=" Username" className="h-13 w-full rounded-xl border border-white/4 bg-panel px-4 pl-11 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-500 dark:placeholder:text-slate-300 focus:border-white/10 dark:focus:bg-[#232933]" />
                                </div>
                            </div>

                            <div className="mail flex flex-col gap-2.5">
                                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900 dark:text-white/45">
                                    Email
                                </label>
                                {emailError && <div className="alert-mail text-xs font-semibold text-red-400">{emailError}</div>}
                                <div className="field relative text-slate-900 dark:text-white/35">
                                    <img src={emailicon} alt="mail icon" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-75" />
                                    <input id="email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="email@example.com" className="h-13 w-full rounded-xl border border-white/4 bg-panel px-4 pl-11 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-500 dark:placeholder:text-slate-300 focus:border-white/10 dark:focus:bg-[#232933]" />
                                </div>
                            </div>

                            <div className="name flex flex-col gap-2.5">
                                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900 dark:text-white/45">
                                    Password
                                </label>
                                {passError && <div className="alert-pass text-xs font-semibold text-red-400">{passError}</div>}
                                <PasswordInput
                                    id="password"
                                    name="pass"
                                    value={formData.pass}
                                    onChange={handleChange}
                                    placeholder="Min. 8 chars"
                                />
                            </div>

                            <div className="name flex flex-col gap-2.5">
                                <label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-900 dark:text-white/45">
                                    Confirm Password
                                </label>
                                {confirmPassError && <div className="alert-confirm-pass text-xs font-semibold text-red-400">{confirmPassError}</div>}
                                <PasswordInput
                                    id="confirm-password"
                                    name="confirmPass"
                                    value={formData.confirmPass}
                                    onChange={handleChange}
                                    placeholder="Re-enter your password"
                                />
                            </div>
                        </div>

                        <div className="mt-9 text-center">
                            {submitError && <p className="mb-3 text-xs font-semibold text-red-400">{submitError}</p>}
                            <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-light-mint-green to-vibrant-mint-green p-4 text-base font-black tracking-tight text-dark-mint-green shadow-[0_16px_35px_rgba(0,252,154,0.24)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
                                {isSubmitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                            </button>
                            <p className="paragraph-muted-sm mt-12 text-base">
                                Already have an account?
                                <Link to="/login" className="mx-1 font-semibold text-vibrant-mint-green">
                                    Login
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
    );
}

export default Signup;