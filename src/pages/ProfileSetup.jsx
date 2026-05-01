import { Navigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ProfileSetupComponent from "../components/Register/ProfileSetup";
import { isAuthenticated } from "../services/authService";

function ProfileSetup() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <ProfileSetupComponent />
      <Footer />
    </>
  );
}

export default ProfileSetup;
