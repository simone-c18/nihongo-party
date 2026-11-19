import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createRoom, joinRoom } from '../firebase/roomcode.js'

export default function Profile({ mode }) {
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { code } = useParams()
  const isHost = mode === 'host'
  const isComplete = nickname.trim().length > 0

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleContinue(event) {
    event.preventDefault()
    if (!isComplete || loading) return
    setLoading(true)
    setError('')
    try {
      const name = nickname.trim()
      const roomCode = isHost ? await createRoom(name) : await joinRoom(code, name)
      navigate(`/lobby/${roomCode}`, { state: { nickname: name, isHost }, replace: true })
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not enter the lobby.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <form onSubmit={handleContinue}>
        <div className="nickname_section">
          <h2>{isHost ? 'create your profile' : 'join the party'}</h2>
          <h3>your nickname:</h3>
          <input
            ref={inputRef}
            type="text"
            className="nickname_input"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={12}
            placeholder="enter your nickname"
            aria-label="Your Nickname"
            autoComplete="off"
            disabled={loading}
          />
          <p>You'll choose your character inside Sakura Square!</p>
        </div>
        {error && <p role="alert" style={{ color: '#b84c65' }}>{error}</p>}
        <div className="button_group">
          <button type="submit" className={`button${isComplete ? '' : ' disabled'}`} disabled={!isComplete || loading} style={{ opacity: isComplete && !loading ? 1 : 0.5 }}>
            {loading ? (isHost ? 'creating room...' : 'joining room...') : 'continue'}
          </button>
          <Link to={isHost ? '/' : '/join'} className="button secondary_button">back</Link>
        </div>
      </form>
    </main>
  )
}