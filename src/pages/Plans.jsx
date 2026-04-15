import Navbar from "../components/Navbar";

function Plans() {
    return (
        <>
            <Navbar />
            <section className="mx-auto w-full max-w-6xl px-4 py-8 text-white sm:px-6 lg:py-10">
                <h1 className="mb-6 text-left text-3xl font-bold sm:text-4xl md:text-5xl">Our Plans</h1>

                <div className="overflow-x-auto rounded-xl border border-slate-700">
                    <table className="min-w-full border-collapse bg-slate-950/40">
                        <thead>
                            <tr className="border-b border-slate-700 text-left text-slate-400">
                                <th className="px-4 py-4 text-sm font-medium sm:px-6">Plan</th>
                                <th className="px-4 py-4 text-sm font-medium sm:px-6">Price</th>
                                <th className="px-4 py-4 text-sm font-medium sm:px-6">Features</th>
                                <th className="px-4 py-4 text-sm font-medium sm:px-6">Lessons</th>
                                <th className="px-4 py-4 text-sm font-medium sm:px-6">Support</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-800">
                                <td className="px-4 py-4 text-sm sm:px-6">Free</td>
                                <td className="px-4 py-4 text-sm sm:px-6">Free</td>
                                <td className="px-4 py-4 text-sm sm:px-6">Limited</td>
                                <td className="px-4 py-4 text-sm sm:px-6">10</td>
                                <td className="px-4 py-4 text-sm sm:px-6">Community</td>
                            </tr>
                            <tr className="border-b border-slate-800 bg-slate-900/70">
                                <td className="border-l-4 border-emerald-400 px-4 py-4 text-sm font-semibold text-emerald-300 sm:px-6">Pro</td>
                                <td className="px-4 py-4 text-sm sm:px-6">$10/mo</td>
                                <td className="px-4 py-4 text-sm sm:px-6">Advanced</td>
                                <td className="px-4 py-4 text-sm sm:px-6">Unlimited</td>
                                <td className="px-4 py-4 text-sm sm:px-6">Priority</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-4 text-sm sm:px-6">School</td>
                                <td className="px-4 py-4 text-sm sm:px-6">$3/mo</td>
                                <td className="px-4 py-4 text-sm sm:px-6">Custom</td>
                                <td className="px-4 py-4 text-sm sm:px-6">Unlimited</td>
                                <td className="px-4 py-4 text-sm sm:px-6">Dedicated</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p className="mt-4 text-sm text-slate-400">All plans include a free 7-day trial.</p>
            </section>
        </>
    )
}

export default Plans;