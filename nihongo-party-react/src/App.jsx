import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Join from './pages/Join.jsx'
import Lobby from './pages/Lobby.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/join" element={<Join />} />
      {/* /lobby = host view, /lobby/:code = player who joined with a code */}
      <Route path="/lobby/:code?" element={<Lobby />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
