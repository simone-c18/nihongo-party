import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Join from './pages/Join.jsx'
import SakuraLobby from './pages/SakuraLobby.tsx'
export default function App() { return <Routes><Route path="/" element={<Landing/>}/><Route path="/join" element={<Join/>}/><Route path="/lobby/:code" element={<SakuraLobby/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes> }
