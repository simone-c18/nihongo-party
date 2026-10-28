import { Link, useParams } from 'react-router-dom'

const MAX_PLAYERS = 4
const AVATARS = ['🐻', '🐰', '🐱', '🦊']

// TODO: replace with the real room code + player list from Firebase RTDB.
const PLACEHOLDER_CODE = 'T8ZGCT'
const PLACEHOLDER_PLAYERS = 1

export default function Lobby() {
  const { code } = useParams()
  const roomCode = code ?? PLACEHOLDER_CODE
  const playerCount = PLACEHOLDER_PLAYERS
  const canBegin = playerCount > 1

  return (
    <main className="container">
      <h2>🌸 your party is ready! 🌸</h2>
      <h3>share this code with your friends!</h3>

      <div className="code_card">
        <span className="code_label">ROOM CODE</span>
        <span className="code">{roomCode}</span>
      </div>

      <div className="player_count">
        <span>🐻 {playerCount} / {MAX_PLAYERS} players</span>
      </div>

      <div className="avatar_grid">
        {AVATARS.map((avatar, i) => (
          <div
            key={avatar}
            className={`avatar_slot ${i < playerCount ? 'joined' : 'empty'}`}
          >
            {avatar}
          </div>
        ))}
      </div>

      <div className="lobby_begin">
        {canBegin ? (
          <Link to="/game" className="button">BEGIN GAME</Link>
        ) : (
          <p className="waiting_text">waiting for friends... ♡</p>
        )}
      </div>

      <Link to="/join" className="button secondary_button">back</Link>
    </main>
  )
}
