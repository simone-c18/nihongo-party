
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createRoom } from '../firebase/roomcode.js'
import landing from '../assets/landing.png'

export default function Landing() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleHostGame() {
    if (loading) return

    setLoading(true)
    setError('')

    try {
      const roomCode = await createRoom()
      navigate(`/lobby/${roomCode}`, {
        state: { isHost: true }
      })
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not create a room.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <h1>nihongo party</h1>
      <h3>the fun way to learn Japanese!</h3>
      <img src={landing} alt="Two Animated Bears" />

      <div className="button_group">
        <button
          type="button"
          className="button"
          onClick={handleHostGame}
          disabled={loading}
        >
          {loading ? 'creating room...' : 'host game'}
        </button>

        <Link to="/join" className="button">
          join room
        </Link>
      </div>

      {error && <p role="alert">{error}</p>}
    </main>
  )
}
