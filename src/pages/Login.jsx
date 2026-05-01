import LoginComponent from "../components/Register/Login"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Navigate } from "react-router-dom"
import { isAuthenticated } from "../services/authService"

function Login() {
    if (isAuthenticated()) {
        return <Navigate to="/" replace />
    }

    return (
        <>
            <Navbar />
            <LoginComponent/>
            <Footer />
        </>
    )
}

export default Login
