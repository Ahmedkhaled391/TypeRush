import {Link} from "react-router-dom";
function Cta() {
    return (
        <section className="mx-auto my-16 flex h-96 w-full max-w-6xl items-center justify-center px-4 sm:px-6">
            <div className="w-full rounded-4xl bg-linear-to-r from-light-mint-green to-vibrant-mint-green p-3 shadow-lg shadow-vibrant-mint-green/25">
                <div className="flex min-h-56 flex-col items-center justify-center gap-8 rounded-3xl  px-5 py-8 text-center text-cta-ink shadow-lg shadow-vibrant-mint-green sm:min-h-64 sm:px-8 sm:py-10">
                    <h2 className="m-0 max-w-[18ch] text-3xl leading-none font-extrabold tracking-tight">
                        Ready to break the 100 WPM barrier?
                    </h2>
                    <Link
                        to="/plans"
                        className="rounded-xl bg-cta-button px-6 py-3 text-sm font-bold text-cta-button-text transition duration-150 hover:-translate-y-px hover:bg-cta-button-hover"
                    >
                        Join the Elite
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default Cta;