import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const CODE_LENGTH = 6

export default function Join() {
  const [chars, setChars] = useState(Array(CODE_LENGTH).fill(''))
  const inputs = useRef([])
  const navigate = useNavigate()

  const code = chars.join('')
  const isComplete = code.length === CODE_LENGTH

  const handleChange = (i, e) => {
    const value = e.target.value.slice(-1).toUpperCase()
    setChars((prev) => prev.map((c, idx) => (idx === i ? value : c)))
    if (value && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !chars[i] && i > 0) inputs.current[i - 1]?.focus()
    if (e.key === 'Enter' && isComplete) navigate(`/lobby/${code}`)
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\s/g, '')
      .toUpperCase()
      .slice(0, CODE_LENGTH)
    if (!pasted) return
    e.preventDefault()
    setChars(Array.from({ length: CODE_LENGTH }, (_, i) => pasted[i] ?? ''))
    inputs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus()
  }

  return (
    <main className="container">
      <h2>enter room <br />code below:</h2>

      <div className="form" onPaste={handlePaste}>
        {chars.map((c, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
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

      <div className="button_group">
        <Link
          to={`/lobby/${code}`}
          className={`button${isComplete ? '' : ' disabled'}`}
          aria-disabled={!isComplete}
        >
          continue
        </Link>
        <Link to="/" className="button secondary_button">back</Link>
      </div>
    </main>
  )
}
