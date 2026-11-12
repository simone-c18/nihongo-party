
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { findRoom } from '../firebase/roomcode.js'

const CODE_LENGTH = 6

export default function Join() {
  const [chars, setChars] = useState(
    Array(CODE_LENGTH).fill('')
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputs = useRef([])
  const navigate = useNavigate()

  const code = chars.join('')
  const isComplete = code.length === CODE_LENGTH

  const handleChange = (i, e) => {
    const value = e.target.value
      .slice(-1)
      .toUpperCase()

    setChars((prev) =>
      prev.map((c, idx) => (idx === i ? value : c))
    )

    if (value && i < CODE_LENGTH - 1) {
      inputs.current[i + 1]?.focus()
    }
  }

  const handleKeyDown = (i, e) => {
    if (
      e.key === 'Backspace' &&
      !chars[i] &&
      i > 0
    ) {
      inputs.current[i - 1]?.focus()
    }

    if (e.key === 'Enter' && isComplete) {
      handleContinue()
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

    setChars(
      Array.from(
        { length: CODE_LENGTH },
        (_, i) => pasted[i] ?? ''
      )
    )
  }

  const handleContinue = async () => {
    if (!isComplete || loading) return

    setLoading(true)
    setError('')

    try {
      await findRoom(code)

      navigate(`/join/profile/${code}`)
    } catch (err) {
      console.error(err)
      setError(
        err.message || 'Could not find that room.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <h1>join room</h1>

      <p>enter your room code</p>

      <div
        className="code_input_group"
        onPaste={handlePaste}
      >
        {chars.map((c, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el
            }}
            type="text"
            className="code_box"
            maxLength={1}
            value={c}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            aria-label={`Room code character ${i + 1}`}
          />
        ))}
      </div>

      {error && <p role="alert">{error}</p>}

      <div className="button_group">
        <button
          type="button"
          className="button"
          disabled={!isComplete || loading}
          onClick={handleContinue}
        >
          {loading ? 'checking...' : 'continue'}
        </button>

        <Link
          to="/"
          className="button secondary_button"
        >
          back
        </Link>
      </div>
    </main>
  )
}
