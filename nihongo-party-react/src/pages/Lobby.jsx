
import { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { listenToRoom } from '../firebase/roomcode.js'

const MAX_PLAYERS = 4
const AVATARS = ['🐻', '🐰', '🐱', '🦊']

export default function Lobby() {
  const { code } = useParams()
  const location = useLocation()

  const [room, setRoom] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const isHost = location.state?.isHost === true

  useEffect(() => {
    if (!code) {
      setError('No room code provided.')
      setLoading(false)
      return
    }

    const unsubscribe = listenToRoom(
      code,
      (roomData) => {
        setRoom(roomData)
        setLoading(false)

        if (!roomData) {
          setError('Room not found.')
        } else {
          setError('')
        }
      }
    )

    return () => unsubscribe()
  }, [code])

  const players = Object.entries(room?.players || {})
  const playerCount = players.length
  const canBegin = isHost && playerCount > 1

  if (loading) {
    return <main className="container">loading lobby...</main>
  }

  if (error) {
    return <main className="container">{error}</main>
  }

  return (
    <main className="container">
      <h2>🌸 your party is ready! 🌸</h2>
      <h3>share this code with your friends!</h3>

      <div className="code_card">
        <span className="code_label">ROOM CODE</span>
        <span className="code">{code}</span>
      </div>

      <div className="player_count">
        <span>🐻 {playerCount} / {MAX_PLAYERS} players</span>
      </div>

      <div className="avatar_grid">
        {AVATARS.map((avatar, i) => {
          const player = players[i]?.[1]

          return (
            <div
              key={i}
              className={`avatar_slot ${player ? 'joined' : 'empty'}`}
              title={player?.nickname || 'Empty slot'}
            >
              {avatar}
            </div>
          )
        })}
      </div>

      <div className="lobby_begin">
        {canBegin ? (
          <button type="button" className="button" disabled>
            BEGIN GAME (coming soon)
          </button>
        ) : (
          <p className="waiting_text">
            waiting for friends... ♡
          </p>
        )}
      </div>

      <Link to="/" className="button secondary_button">
        back
      </Link>
    </main>
  )
}
