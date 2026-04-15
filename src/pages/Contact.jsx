import Navbar from "../components/Navbar"   

function Contact() {
    return (
        <>
            <Navbar />
            <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-8 text-white sm:px-6 lg:grid-cols-2 lg:py-10">
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Contact Us</h1>
                        <p className="mt-3 text-sm text-slate-400 sm:text-base">Have questions or feedback? We are here to help!</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <i className="fa-solid fa-envelope mt-1 text-emerald-400"></i>
                            <div>
                                <p className="font-semibold text-white">Email</p>
                                <p className="text-sm text-slate-400">ahmedkhaled39119@gmail.com</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <i className="fa-solid fa-location-dot mt-1 text-emerald-400"></i>
                            <div>
                                <p className="font-semibold text-white">Location</p>
                                <p className="text-sm text-slate-400">6th of October ,Giza</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <i className="fa-solid fa-clock mt-1 text-emerald-400"></i>
                            <div>
                                <p className="font-semibold text-white">Working Hours</p>
                                <p className="text-sm text-slate-400">Mon-Fri, 9am-6pm PST</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form className="flex w-full flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900/50 p-5 sm:p-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-sm font-medium text-slate-100">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-100">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="subject" className="text-sm font-medium text-slate-100">
                            Subject
                        </label>
                        <input
                            id="subject"
                            type="text"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="message" className="text-sm font-medium text-slate-100">
                            Message
                        </label>
                        <textarea
                            name="message"
                            id="message"
                            rows="6"
                            placeholder="Write your message"
                            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
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
