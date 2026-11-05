
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listenToRoom, claimCharacter } from '../firebase/roomcode.js'
import { auth } from '../firebase/firebase.js'

const MAX_PLAYERS = 4

const AVATARS = [
  { id: 'bear', emoji: '🐻', name: 'Bear' },
  { id: 'bunny', emoji: '🐰', name: 'Bunny' },
  { id: 'cat', emoji: '🐱', name: 'Cat' },
  { id: 'fox', emoji: '🦊', name: 'Fox' }
]

export default function Lobby() {
  const { code } = useParams()

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [claimError, setClaimError] = useState('')
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    if (!code) {
      setError('No room code provided.')
      setLoading(false)
      return
    }

    const unsubscribe = listenToRoom(code, (data) => {
      setRoom(data)
      setLoading(false)
      setError(data ? '' : 'Room not found.')
    })

    return () => unsubscribe()
  }, [code])

  const players = Object.entries(room?.players || {})
  const claims = room?.characterClaims || {}
  const playerCount = players.length
  const currentUserId = auth.currentUser?.uid

  const isHost = Boolean(
    currentUserId && room?.hostId === currentUserId
  )

  const myCharacter = AVATARS.find(
    (avatar) => claims[avatar.id] === currentUserId
  )

  const canBegin = isHost && playerCount > 1

  async function handleCharacterClick(character) {
    if (claiming || !currentUserId) return

    setClaiming(true)
    setClaimError('')

    try {
      await claimCharacter(code, character)
    } catch (err) {
      console.error(err)
      setClaimError(
        err.message || 'Could not select character.'
      )
    } finally {
      setClaiming(false)
    }
  }

  if (loading) {
    return <main className="container">loading lobby...</main>
  }

  if (error) {
    return (
      <main className="container">
        <p role="alert">{error}</p>
        <Link to="/" className="button secondary_button">
          back
        </Link>
      </main>
    )
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

      <h3>choose your character!</h3>

      <div className="avatar_grid">
        {AVATARS.map((avatar) => {
          const ownerId = claims[avatar.id]
          const isMine = Boolean(
            currentUserId && ownerId === currentUserId
          )
          const isTaken = Boolean(ownerId) && !isMine

          return (
            <button
              key={avatar.id}
              type="button"
              className={`avatar_slot ${
                ownerId ? 'joined' : 'empty'
              }`}
              disabled={isTaken || claiming || !currentUserId}
              onClick={() => handleCharacterClick(avatar.id)}
              aria-pressed={isMine}
              title={
                isMine
                  ? 'Your character'
                  : isTaken
                    ? 'Already claimed'
                    : 'Select character'
              }
            >
              <span>{avatar.emoji}</span>
              <span style={{ fontSize: '12px' }}>
                {isMine
                  ? 'yours ♡'
                  : isTaken
                    ? 'taken'
                    : avatar.name}
              </span>
            </button>
          )
        })}
      </div>

      {myCharacter && (
        <p className="waiting_text">
          you selected {myCharacter.name}! ♡
        </p>
      )}

      {claimError && (
        <p role="alert">{claimError}</p>
      )}

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
