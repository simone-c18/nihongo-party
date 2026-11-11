import { Link, useParams, useLocation } from 'react-router-dom'

import PochaccoHead from '../assets/avatars/Pochacco_Head.png'
import MyMelodyHead from '../assets/avatars/Melody_Head.png'
import KuromiHead from '../assets/avatars/Kuromi_Head.png'
import CinnamarollHead from '../assets/avatars/Cinnamaroll_Head.png'

const MAX_PLAYERS = 4
const AVATARS = [
  {id: "Pochacco", name:"Pochacco", src: PochaccoHead },
  {id: "Mymelody", name:"My Melody", src: MyMelodyHead },
  {id: "Kuromi", name:"Kuromi", src: KuromiHead },
  {id: "Cinnamaroll", name:"Cinnamaroll", src: CinnamarollHead },
]

const AVATAR_MAP = {
  "Pochacco": PochaccoHead,
  "Mymelody": MyMelodyHead,
  "Kuromi": KuromiHead,
  "Cinnamaroll": CinnamarollHead,
}

// TODO: replace with the real room code + player list from Firebase RTDB.
const PLACEHOLDER_CODE = 'T8ZGCT'
const PLACEHOLDER_PLAYERS = 1

export default function Lobby() {
  const { code } = useParams()
  const location = useLocation()

  const roomCode = code ?? PLACEHOLDER_CODE

  const userNickname = location.state?.nickname || 'You'
  const userAvatarId = location.state?.selectedAvatar || null
  const isHost = location.state?.isHost || false
  const hasJoined = userAvatarId !== null

  const playerCount = hasJoined ? 1 : 0
  const canBegin = isHost && playerCount > 1

  const slots = [
    {
      name: hasJoined ? userNickname: 'Host (waiting...)',
      avatar: hasJoined ? AVATAR_MAP[userAvatarId] : null,
      joined: hasJoined,
      isHostSlot: true
    },
    { name: 'waiting...', avatar: null, joined: false },
    { name: 'waiting...', avatar: null, joined: false },
    { name: 'waiting...', avatar: null, joined: false },
  ]

  return (
    <main className="container">
      <h2>🌸 your party is ready! 🌸</h2>
      <h3>share this code with your friends!</h3>

      <div className="code_card">
        <span className="code_label">ROOM CODE</span>
        <span className="code">{roomCode}</span>
      </div>

      <div className="player_count">
        <span> {playerCount} / {MAX_PLAYERS} players</span>
      </div>

      <div className="avatar_row">
        {slots.map((slot, i) => (
          <div
            key={i}
            className={`avatar_slot ${slot.joined  ? 'joined' : 'empty'}`}
          >
            <span className = "avatar_slot_name">
              {slot.name}
            </span>

            {slot.joined && slot.avatar ? (
              <img src = {slot.avatar} alt = {slot.name} className = "lobby_avatar_img" />
            ) : (
              <div className="empty_avatar_placeholder" />
            )}
          </div>
        ))}
      </div>

      <div className="lobby_begin">
        {canBegin ? (
          <Link to="cute_lobby" className="button">Lobby</Link>
        ) : (
          <p className="waiting_text">waiting for friends... ♡</p>
        )}
      </div>

      <Link to="/" className="button secondary_button">back</Link>
    </main>
  )
}
