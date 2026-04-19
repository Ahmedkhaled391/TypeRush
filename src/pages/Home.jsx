import Navbar from "../components/Navbar"
import Hero from "../components/Homepage/Hero"
import Multiplayer from "../components/Homepage/Multiplayersection"
import Cta from "../components/Homepage/Cta"
import Footer from "../components/Footer"

function Home() {
    return (
        <>
            <Navbar />
            <Hero />
            <Multiplayer />
            <Cta/>
            <Footer />
        </>
    )
}
export default Home;