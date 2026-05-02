import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Lessons from './pages/Lessons'
import Register from './pages/Register'
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import Multiplater from './pages/Multiplayer'
import Practise from './components/Lessons/Practise'
import Results from './pages/Results'
import ProfileSetup from './pages/ProfileSetup'
import Stats from './pages/Stats'
import { isAuthenticated, subscribeAuthChanges } from './services/authService'


function App() {
  const [authed, setAuthed] = useState(() => isAuthenticated())

  useEffect(() => {
    const unsubscribe = subscribeAuthChanges(() => {
      setAuthed(isAuthenticated())
    })

    return unsubscribe
  }, [])

  function requireAuth(element) {
    return authed ? element : <Navigate to="/" replace />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={authed ? <Home /> : <Register />} />
        <Route path="/lessons" element={requireAuth(<Lessons />)} />
        <Route path="/lessons/:lessonNumber/practise" element={requireAuth(<Practise />)} />
        <Route path="/lessons/:lessonNumber/results" element={requireAuth(<Results />)} />
        <Route path="/contact" element={requireAuth(<Contact />)} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/profile-setup" element={requireAuth(<ProfileSetup />)} />
        <Route path="/challenge" element={requireAuth(<Multiplater />)} />
        <Route path="/stats" element={requireAuth(<Stats />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
