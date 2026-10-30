
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { joinRoom } from '../firebase/roomcode.js'

const CODE_LENGTH = 6

export default function Join() {
  const [chars, setChars] = useState(Array(CODE_LENGTH).fill(''))
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputs = useRef([])
  const navigate = useNavigate()

  const code = chars.join('')
  const isComplete = code.length === CODE_LENGTH

  const handleChange = (i, e) => {
    const value = e.target.value.slice(-1).toUpperCase()
    setChars(prev => prev.map((c, idx) => idx === i ? value : c))
    if (value && i < CODE_LENGTH - 1) {
      inputs.current[i + 1]?.focus()
    }
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !chars[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }

    if (e.key === 'Enter' && isComplete) {
      handleJoin()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\s/g, '')
      .toUpperCase()
      .slice(0, CODE_LENGTH)

    if (!pasted) return

    e.preventDefault()
    setChars(Array.from(
      { length: CODE_LENGTH },
      (_, i) => pasted[i] ?? ''
    ))
  }

  async function handleJoin() {
    if (!isComplete || loading) return

    setLoading(true)
    setError('')

    try {
      const joinedCode = await joinRoom(code, nickname.trim() || 'Player')
      navigate(`/lobby/${joinedCode}`, {
        state: { isHost: false }
      })
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not join room.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <h2>enter room <br />code below:</h2>

      <div className="form" onPaste={handlePaste}>
        {chars.map((c, i) => (
          <input
            key={i}
            ref={el => inputs.current[i] = el}
            type="text"
            className="code_box"
            maxLength={1}
            value={c}
            onChange={e => handleChange(i, e)}
            onKeyDown={e => handleKeyDown(i, e)}
            aria-label={`Room code character ${i + 1}`}
          />
        ))}
      </div>

      <input
        type="text"
        placeholder="your nickname"
        maxLength={20}
        value={nickname}
        onChange={e => setNickname(e.target.value)}
        aria-label="Your nickname"
      />

      {error && <p role="alert">{error}</p>}

      <div className="button_group">
        <button
          type="button"
          className="button"
          disabled={!isComplete || loading}
          onClick={handleJoin}
        >
          {loading ? 'joining...' : 'continue'}
        </button>

        <Link to="/" className="button secondary_button">
          back
        </Link>
      </div>
    </main>
  )
}
