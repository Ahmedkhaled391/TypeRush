import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Lessons from './pages/Lessons'
import Register from './pages/Register'
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import Multiplater from './pages/Multiplayer'
import Practise from './components/Lessons/Practise'
import Results from './pages/Results'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/lessons/:lessonNumber/practise" element={<Practise />} />
        <Route path="/lessons/:lessonNumber/results" element={<Results />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/challenge" element={<Multiplater />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
