import Signup from "../components/Register/Signup"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Navigate } from "react-router-dom"
import { isAuthenticated } from "../services/authService"

function Register() {
    if (isAuthenticated()) {
        return <Navigate to="/" replace />
    }

    return ( 
        <>
        <Navbar />
        <Signup />
        <Footer />
        </>
    
    );
}

export default Register;