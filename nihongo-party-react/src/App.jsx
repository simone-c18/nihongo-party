import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Join from './pages/Join.jsx'
import Lobby from './pages/Lobby.jsx'
import Profile from './pages/Profile.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/host/profile" element={<Profile mode="host" />} />

      <Route path="/join" element={<Join />} />
      <Route path="/join/profile/:code" element={<Profile mode="join" />} />

      {/* /lobby = host view, /lobby/:code = player who joined with a code */}
      <Route path="/lobby/:code?" element={<Lobby />} />
      <Route path="/lobby" element={<Lobby />} />
      
    </Routes>
  )
}
