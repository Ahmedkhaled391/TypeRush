import Navbar from "../components/Navbar";
import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";
import { isValidEmail } from "../utils/validators";

function Contact() {
    const form = useRef(null);

    const sendEmail = (e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const email = String(formData.get("email") || "").trim();

        if (!isValidEmail(email)) {
            Swal.fire("Invalid email", "Please enter a valid email address.", "warning");
            return;
        }

        emailjs
            .sendForm("service_v3ys3i9", "template_v21wawn", form.current, {
                publicKey: "kx0S0MVlBLS5w45Wr",
            })
            .then(
                () => {
                    Swal.fire("Sent!", "Your message has been sent successfully.", "success");
                    e.target.reset();
                },
                (error) => {
                    Swal.fire("Error!", "There was an error sending your message: " + error.text, "error");
                },
            );
    };

    return (
        <>
            <Navbar />
            <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-8 text-slate-900 dark:text-white sm:px-6 lg:grid-cols-2 lg:py-10">
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Contact Us</h1>
                        <p className="mt-3 paragraph-muted-responsive">Have questions or feedback? We are here to help!</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <i className="fa-solid fa-envelope mt-1 text-emerald-400"></i>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">Email</p>
                                <p className="paragraph-muted-sm">ahmedkhaled39119@gmail.com</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <i className="fa-solid fa-location-dot mt-1 text-emerald-400"></i>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">Location</p>
                                <p className="paragraph-muted-sm">6th of October ,Giza</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <i className="fa-solid fa-clock mt-1 text-emerald-400"></i>
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white">Working Hours</p>
                                <p className="paragraph-muted-sm">Mon-Fri, 9am-6pm PST</p>
                            </div>
                        </div>
                    </div>
                </div>
                    {/* Form */}
                <form ref={form} className="flex w-full flex-col gap-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 p-5 sm:p-6" onSubmit={sendEmail}>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-100">
                            Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-100">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="subject" className="text-sm font-medium text-slate-700 dark:text-slate-100">
                            Subject
                        </label>
                        <input
                            id="subject"
                            name="subject"
                            type="text"
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-100">
                            Message
                        </label>
                        <textarea
                            name="message"
                            id="message"
                            rows="6"
                            placeholder="Write your message"
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-emerald-400 px-6 py-3 font-semibold text-slate-950 sm:w-fit sm:self-center"
                    >
                        Send Message
                    </button>
                </form>
            </section>
        </>
    )

}

export default Contact;
