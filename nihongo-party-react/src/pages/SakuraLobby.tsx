import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { auth } from "../firebase/firebase.js"
import { getCurrentPlayer, listenToRoom, claimCharacter, setPlayerPosition, startGame, submitAnswer, advanceRound } from "../firebase/roomcode.js"
import { getQuestions } from "../firebase/questions.js"
import { prepareMinigame1 } from "../firebase/minigame1.js"
import "../styles/sakuraSquare.css"

type IconName = "book" | "check" | "copy" | "gear" | "invite" | "leaf" | "lock" | "sound" | "users"

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v15h4.5a2.5 2.5 0 0 1 2.5 2.5v-15Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    copy: (
      <>
        <rect x="8" y="8" width="11" height="11" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </>
    ),
    gear: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.95 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.6 8.95a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.95 4.6 1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 1.05 1.52 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 8.95 1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
      </>
    ),
    invite: (
      <>
        <path d="M15 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 4C12 4 5 8 5 15c0 2.8 2.2 5 5 5 7 0 10-8 10-16Z" />
        <path d="M4 21c2-5 6-9 12-12" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    sound: (
      <>
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        <path d="M15 9.5a4 4 0 0 1 0 5M18 7a7.5 7.5 0 0 1 0 10" />
      </>
    ),
    users: (
      <>
        <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  )
}

type Player = {
  id: string
  name: string
  characterId: CharacterId | null
  role: string
  host?: boolean
  x: number
  y: number
}

type CharacterId = "my-melody" | "kuromi" | "cinnamoroll" | "pochacco"

type Character = {
  id: CharacterId
  name: string
  image: string
  color: string
}

const characters: Character[] = [
  {
    id: "my-melody",
    name: "My Melody",
    image: "/assets/figma-74-22/assets/fdfb3.png",
    color: "#f7b8c8",
  },
  {
    id: "kuromi",
    name: "Kuromi",
    image: "/assets/characters/kuromi.png",
    color: "#8c8296",
  },
  {
    id: "cinnamoroll",
    name: "Cinnamoroll",
    image: "/assets/characters/cinnamoroll.png",
    color: "#9fd9ed",
  },
  {
    id: "pochacco",
    name: "Pochacco",
    image: "/assets/figma-74-19/assets/8d8d6.png",
    color: "#f2cf72",
  },
]

function getCharacter(id: CharacterId) {
  return characters.find((character) => character.id === id) || { id: "my-melody", name: "Choosing", image: "", color: "#dce8df" }
}

function Avatar({ player, large = false }: { player: Player; large?: boolean }) {
  const character = player.characterId ? getCharacter(player.characterId) : { name: "Choosing", image: "", color: "#dce8df" }
  return (
    <div
      className={`character-avatar ${large ? "character-avatar-large" : ""}`}
    >
      <span
        className="character-glow"
        style={{ backgroundColor: character.color }}
      />
      {character.image ? <img alt={character.name} src={character.image} /> : <span aria-label="Choosing a character">?</span>}
    </div>
  )
}

function Tree({ className }: { className: string }) {
  return (
    <div className={`tree ${className}`}>
      <div className="tree-crown">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="tree-trunk" />
      <div className="petals">
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}

function Lamp({ className }: { className: string }) {
  return (
    <div className={`lamp ${className}`}>
      <span className="lamp-top" />
      <span className="lamp-light" />
      <span className="lamp-post" />
      <span className="lamp-base" />
    </div>
  )
}

function Plaza({ players, currentId }: { players: Player[]; currentId: string }) {
  return (
    <section className="plaza-card" aria-label="Sakura plaza waiting area">
      <div className="plaza-sky">
        <span className="cloud cloud-one" />
        <span className="cloud cloud-two" />
        <div className="school">
          <span className="school-roof" />
          <span className="school-clock">10:24</span>
          <span className="school-window school-window-one" />
          <span className="school-window school-window-two" />
          <span className="school-door">
            <i />
            <i />
          </span>
          <span className="school-sign">SPROUT ACADEMY</span>
          <span className="school-foundation" />
        </div>
      </div>
      <div className="plaza-ground">
        <div className="sidewalk sidewalk-top" />
        <div className="road">
          <span className="road-line road-line-one" />
          <span className="road-line road-line-two" />
          <span className="road-line road-line-three" />
          <span className="road-line road-line-four" />
          <span className="petal-pile petal-pile-one" />
          <span className="petal-pile petal-pile-two" />
        </div>
        <div className="sidewalk sidewalk-bottom" />
        <div className="curb curb-top" />
        <div className="curb curb-bottom" />
        <div className="hedge hedge-left" />
        <div className="hedge hedge-right" />
        <div className="flower-bed flower-bed-left">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="flower-bed flower-bed-right">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <Tree className="tree-left" />
        <Tree className="tree-right" />
        <Lamp className="lamp-left" />
        <Lamp className="lamp-right" />
        <div className="bench bench-left">
          <span />
          <span />
          <span />
        </div>
        <div className="bench bench-right">
          <span />
          <span />
          <span />
        </div>
        <div className="fountain">
          <span className="fountain-bowl" />
          <span className="fountain-water" />
          <span className="fountain-base" />
        </div>
        <div className="vending-machine">
          <span className="vending-glass">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="vending-panel" />
          <span className="vending-slot" />
        </div>
        <div className="watering-can">
          <span />
        </div>
        <div className="plaza-cat">
          <span className="cat-tail" />
          <span className="cat-body" />
          <span className="cat-head">
            <i />
            <i />
          </span>
        </div>
        <span className="butterfly butterfly-one">
          <i />
          <i />
        </span>
        <span className="butterfly butterfly-two">
          <i />
          <i />
        </span>
        {players.map((player) => (
          <div
            className={`scene-player ${
              player.id === currentId ? "is-controlled" : ""
            }`}
            key={player.id}
            style={{ left: `${player.x}%`, top: `${player.y}%` }}
          >
            <Avatar player={player} large />
            <span className="scene-name">
              {player.name}
              {player.host && <i>HOST</i>}
            </span>
          </div>
        ))}
      </div>
      <div className="plaza-status">
        <span className="key-hint">WASD</span>
        or arrow keys to walk
      </div>
    </section>
  )
}

function PlayerRow({ player, index }: { player: Player; index: number }) {
  const character = player.characterId ? getCharacter(player.characterId) : { name: "Choosing", image: "", color: "#dce8df" }
  return (
    <div className="player-row" style={{ animationDelay: `${index * 80}ms` }}>
      <Avatar player={player} />
      <div className="player-info">
        <div className="player-name">
          {player.name}
          {player.host && <span className="host-pill">HOST</span>}
        </div>
        <div
          className={`player-state ${
            player.role === "Ready" ? "is-ready" : ""
          }`}
        >
          <Icon name="check" size={14} />
          {character.name} · {player.role}
        </div>
      </div>
      <span
        className={`connection-dot ${
          player.role === "Choosing a look" ? "is-busy" : ""
        }`}
      />
    </div>
  )
}

export default function SakuraLobby() {
  const { code = "" } = useParams()
  const [room, setRoom] = useState<any>(null)
  const [uid, setUid] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [questions, setQuestions] = useState<any[]>([])
  const [questionError, setQuestionError] = useState("")
  const [copied, setCopied] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [toast, setToast] = useState("")
  const lastMove = useRef(0)
  const roomRef = useRef<any>(null)
  roomRef.current = room
  const isHost = Boolean(uid && room?.hostId === uid)
  const claims: Record<string, string> = room?.characterClaims || {}
  const players: Player[] = Object.entries(room?.players || {}).map(([id, p]: [string, any], i) => {
    const characterId = (characters.find(c => claims[c.id] === id)?.id || null) as CharacterId | null
    const pos = room?.positions?.[id] || { x: 28 + i * 15, y: 40 + (i % 2) * 18 }
    return { id, name: p.nickname || "Player", characterId, role: characterId ? "Ready" : "Choosing a look", host: id === room?.hostId, x: pos.x, y: pos.y }
  })
  const myCharacter = players.find(p => p.id === uid)?.characterId
  const round = room?.game?.currentIndex ?? 0
  const ordered = [...questions].sort((a,b) => a.id.localeCompare(b.id)).slice(0,5)
  const question = ordered[round]
  const answers = room?.answers || {}
  const myAnswer = question ? answers[uid]?.[question.id] : undefined
  const answerCount = question ? players.filter(p => answers[p.id]?.[question.id] !== undefined).length : 0
  const allAnswered = players.length > 0 && answerCount === players.length

  useEffect(() => {
    if (!code) { setError("Missing room code"); setLoading(false); return }
    let active = true
    let unsubscribe = () => {}
    getCurrentPlayer().then(user => {
      if (!active) return
      setUid(user.uid)
      unsubscribe = listenToRoom(code, data => {
        if (!active) return
        setRoom(data)
        setLoading(false)
        setError(data ? "" : "Room not found")
      }, err => { if (active) { setError(err.message); setLoading(false) } })
    }).catch(err => { if (active) { setError(err.message); setLoading(false) } })
    return () => { active = false; unsubscribe() }
  }, [code])
  useEffect(() => { getQuestions().then(prepareMinigame1).then(setQuestions).catch(e => setQuestionError(`Question bank: ${e.message}`)) }, [])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 2600); return () => window.clearTimeout(timer) }, [toast])
  const moveLocalPlayer = useCallback((dx: number, dy: number) => {
    const current = roomRef.current
    if (!current || current.status !== "lobby" || !auth.currentUser) return
    const id = auth.currentUser.uid
    const ids = Object.keys(current.players || {})
    if (!ids.includes(id)) return
    const old = current.positions?.[id] || { x: 28 + ids.indexOf(id)*15, y: 40 + (ids.indexOf(id)%2)*18 }
    const x = Math.max(14, Math.min(82, old.x + dx))
    const y = Math.max(29, Math.min(73, old.y + dy))
    const now = Date.now()
    if (now - lastMove.current < 75) return
    lastMove.current = now
    setPlayerPosition(code, x, y).catch(e => setToast(e.message))
  }, [code])
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (roomRef.current?.status !== "lobby") return
      const target = event.target as HTMLElement
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName)) return
      const moves: Record<string,[number,number]> = { ArrowUp:[0,-3],w:[0,-3],W:[0,-3],ArrowDown:[0,3],s:[0,3],S:[0,3],ArrowLeft:[-3,0],a:[-3,0],A:[-3,0],ArrowRight:[3,0],d:[3,0],D:[3,0] }
      if (!moves[event.key]) return
      event.preventDefault()
      moveLocalPlayer(...moves[event.key])
    }
    window.addEventListener("keydown",handle)
    return () => window.removeEventListener("keydown",handle)
  }, [moveLocalPlayer])
  const copyCode = async () => { try { await navigator.clipboard.writeText(code) ; setCopied(true); setToast("Game code copied") } catch { setToast(`Room code: ${code}`) } }
  const invite = async () => { const link = `${window.location.origin}/join`; try { await navigator.clipboard.writeText(`${link} — room code ${code}`); setToast("Join link and code copied") } catch { setToast(`Share code ${code}`) } }
  const chooseCharacter = async (id: CharacterId) => { try { await claimCharacter(code,id); setToast(`${getCharacter(id).name} selected`) } catch(e:any) { setToast(e.message) } }
  const handleStart = async () => { try { if (!questions.length) throw Error("Questions are still loading"); await startGame(code); setToast("Minigame 1 started!") } catch(e:any) { setToast(e.message) } }
  const handleAnswer = async (answer: string) => { if (!question || myAnswer !== undefined) return; try { await submitAnswer(code,question.id,answer) } catch(e:any) { setToast(e.message) } }
  const handleNext = async () => { try { if (!allAnswered) throw Error("Wait for all players to answer."); await advanceRound(code) } catch(e:any) { setToast(e.message) } }
  if (loading) return <main className="app-shell integration-wait">Loading your Sakura Square room…</main>
  if (error || !room) return <main className="app-shell integration-wait"><p className="integration-error">{error || "Room not found"}</p><Link to="/">Back home</Link></main>
  if (!room.players?.[uid]) return <main className="app-shell integration-wait">You're not a member of this room. <Link to="/join">Join room</Link></main>
  if (room.status === "playing") {
    if (!question) return <main className="app-shell integration-wait">Loading Minigame 1 questions… {questionError}</main>
    const correct = question.answer
    const completed = myAnswer !== undefined
    return (
      <main className="app-shell minigame-shell">
        <header className="topbar"><div className="brand"><span className="brand-mark"><Icon name="leaf" size={23}/></span><span className="brand-name">Nihongo Party</span></div><div className="round-progress"><span>MINIGAME 1 · ENGLISH → JAPANESE</span><strong>{round+1} / {ordered.length}</strong></div><div className="score-chip">{players.length} players connected</div></header>
        <section className="minigame-stage"><div className="sakura-confetti sakura-confetti-left"/><div className="sakura-confetti sakura-confetti-right"/><div className="question-card"><span className="question-kicker">TRANSLATE TO JAPANESE</span><div className="question-number">Question {round+1}</div><h1>{question.english}</h1><p>Choose the Japanese word that matches.</p>
          <div className="answer-grid">{question.options.map((a:string,i:number)=><button key={a} disabled={completed} className={`answer-button ${myAnswer === a ? "is-selected" : ""} ${completed && a === correct ? "is-correct" : ""} ${completed && myAnswer === a && a !== correct ? "is-wrong" : ""}`} onClick={()=>handleAnswer(a)}><span>{String.fromCharCode(65+i)}</span>{a}</button>)}</div>
          <div className="minigame-footer"><div className="answer-status">{completed ? (myAnswer === correct ? "Correct! 🌸" : `The correct answer is ${correct}.`) : "Choose an answer to submit."} · {answerCount}/{players.length} answered</div></div>
          {isHost && <div className="round-actions"><button disabled={!allAnswered || round >= ordered.length-1} onClick={handleNext}>Next question →</button>{round >= ordered.length-1 && <span>Round complete! ♡</span>}</div>}
        </div><div className="minigame-party">{players.map(p=><div key={p.id}><Avatar player={p}/><span>{p.name}</span></div>)}</div></section>
        {toast && <div className="toast">{toast}</div>}
      </main>
    )
  }
  if (room.status !== "lobby") return <main className="app-shell integration-wait">Room state: {room.status}</main>
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="leaf" size={23} />
          </span>
          <span className="brand-name">Nihongo Party</span>
          <span className="brand-tag">LEARN TOGETHER</span>
        </div>
        <div className="lesson-chip">
          <span className="lesson-icon">
            <Icon name="book" size={17} />
          </span>
          <span>
            <small>TODAY’S MISSION</small>
            <strong>Japanese Word Quest</strong>
          </span>
        </div>
        <div className="top-actions">
          <button
            aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
            className={`icon-button ${soundOn ? "" : "is-muted"}`}
            onClick={() => setSoundOn((value) => !value)}
          >
            <Icon name="sound" />
          </button>
          <button
            aria-expanded={showSettings}
            aria-label="Open lobby settings"
            className="icon-button"
            onClick={() => setShowSettings((value) => !value)}
          >
            <Icon name="gear" />
          </button>
          <div className="teacher-avatar">{(players.find(p => p.id === uid)?.name || "P").slice(0,2).toUpperCase()}</div>
        </div>
      </header>

      <div className="content">
        <Link className="lobby-back" to="/">← Home</Link>
        {(error || questionError) && <p className="integration-error" role="alert">{error || questionError}</p>}
        <div className="lobby-heading">
          <div>
            <div className="eyebrow">
              <span /> LIVE LOBBY
            </div>
            <h1>Meet us in Sakura School</h1>
            <p>
              Choose your character, walk around with WASD, and get ready for
              today’s Japanese mission.
            </p>
          </div>
          <div className="code-card">
            <div>
              <span className="code-label">GAME CODE</span>
              <strong>{code}</strong>
            </div>
            <button className="copy-button" onClick={copyCode}>
              <Icon name={copied ? "check" : "copy"} size={18} />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="lobby-grid">
          <Plaza players={players} currentId={uid} />

          <aside className="roster-card">
            <div className="roster-header">
              <div>
                <span className="panel-kicker">OUR CREW</span>
                <h2>Players</h2>
              </div>
              <span className="player-count">
                <Icon name="users" size={16} /> {players.length} / 4
              </span>
            </div>
            <div className="players-list">
              {players.map((player, index) => (
                <PlayerRow key={player.id} player={player} index={index} />
              ))}
            </div>
            <div className="character-select">
              <div className="character-select-heading">
                <span>CHOOSE YOUR CHARACTER</span>
                <small>One per player</small>
              </div>
              <div className="character-options">
                {characters.map((character) => {
                  const claimedBy = players.find(
                    (player) =>
                      player.characterId === character.id &&
                      player.id !== uid,
                  )
                  const isSelected = players.some(
                    (player) =>
                      player.id === uid &&
                      player.characterId === character.id,
                  )
                  return (
                    <button
                      aria-label={`Select ${character.name}`}
                      className={`character-option ${
                        isSelected ? "is-selected" : ""
                      } ${claimedBy ? "is-claimed" : ""}`}
                      disabled={Boolean(claimedBy)}
                      key={character.id}
                      onClick={() => chooseCharacter(character.id)}
                    >
                      <img alt="" src={character.image} />
                      <span>
                        {isSelected
                          ? "YOU"
                          : claimedBy
                            ? claimedBy.name
                            : "FREE"}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
            <button className="invite-button" onClick={invite}>
              <Icon name="invite" size={19} />
              Invite classmates
            </button>
            <div className="privacy-note">
              <Icon name="lock" size={14} /> Only players with the code can join
            </div>
          </aside>
        </div>

        <footer className="lobby-footer">
          <div className="tip">
            <span className="tip-icon">
              <Icon name="leaf" size={17} />
            </span>
            <span>
              <strong>While you wait:</strong> Look for the hidden watering can
              in the plaza.
            </span>
          </div>
          {isHost ? <button className="start-button is-host" disabled={players.length < 2 || !questions.length} onClick={handleStart}>Start Minigame 1<span className="start-arrow">→</span></button> : <span>Waiting for host to start… ♡</span>}
        </footer>
      </div>

      {showSettings && (
        <div className="settings-popover">
          <div>
            <strong>Lobby settings</strong>
            <button
              aria-label="Close settings"
              onClick={() => setShowSettings(false)}
            >
              ×
            </button>
          </div>
          <label>
            <span>Lobby music</span>
            <input
              checked={soundOn}
              onChange={(event) => setSoundOn(event.target.checked)}
              type="checkbox"
            />
          </label>
  
        </div>
      )}

      {toast && (
        <div className="toast">
          <Icon name="check" size={17} /> {toast}
        </div>
      )}
    </main>
  )
}
