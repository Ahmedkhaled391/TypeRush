import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Lessons from "./pages/Lessons";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Multiplater from "./pages/Multiplayer";
import Match from "./pages/Match";
import Practise from "./components/Lessons/Practise";
import Results from "./pages/Results";
import ProfileSetup from "./pages/ProfileSetup";
import Stats from "./pages/Stats";
import { ProtectedRoute, useAuth } from "./context/AuthContext";

function App() {
  const { authed } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={authed ? <Home /> : <Register />} />
        <Route
          path="/lessons"
          element={
            <ProtectedRoute>
              <Lessons />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lessons/:lessonNumber/practise"
          element={
            <ProtectedRoute>
              <Practise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lessons/:lessonNumber/results"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/challenge"
          element={
            <ProtectedRoute>
              <Multiplater />
            </ProtectedRoute>
          }
        />
        <Route
          path="/match/:code"
          element={
            <ProtectedRoute>
              <Match />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <Stats />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
