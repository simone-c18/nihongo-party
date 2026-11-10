import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useParams} from "react-router-dom"

// Import Images 
import Pochacco from '../assets/avatars/Pochacco_Full.png'
import MyMelody from '../assets/avatars/Melody_Full.png'
import Kuromi from '../assets/avatars/Kuromi_Full.png'
import Cinnamaroll from '../assets/avatars/Cinnamaroll_Full.png'

// Store avatars in array 
const AVATARS = [
    { id: "Pochacco", src: Pochacco, alt: "Pochacco"},
    { id: "Mymelody", src: MyMelody, alt: "My Melody"},
    { id: "Kuromi", src: Kuromi, alt: "Kuromi"},
    { id: "Cinnamaroll", src: Cinnamaroll, alt: "Cinnamaroll"},
]

export default function Profile({ mode }){
    const [nickname, setNickname] = useState("")
    const [selectedAvatar, setSelectedAvatar] = useState(null)

    const inputRef = useRef(null)
    const navigate = useNavigate()
    const { code } = useParams()

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

    const isComplete = nickname.trim().length > 0  && selectedAvatar !== null
    const lobbyPath = code ? `/lobby/${code}` : '/lobby'

    const handleContinue = (e) => {
        e.preventDefault()
        if (!isComplete) return 
        navigate(lobbyPath, { // Change to Lobby_ User when user lobby page is made 
            state: {
                nickname,
                selectedAvatar,
                isHost: mode == 'host'
            }
        }) 
    }

    return(
        <main className = "container">
            <div className = "nickname_section">
                <h3>your nickname:</h3>
                <input
                    ref={inputRef}
                    type="text"
                    className= "nickname_input"
                    value = {nickname}
                    onChange= {(e) => setNickname(e.target.value)}
                    maxLength= {12}
                    aria-label = "Your Nickname"
                />
            </div>

            <div>
                <h3>your avatar: </h3>
                <div className = "avatar_selection_grid">
                    {AVATARS.map((avatar) => (
                        <button
                            key = {avatar.id}
                            type = "button"
                            className={`avatar_option ${selectedAvatar === avatar.id ? 'selected' : ''}`}
                            onClick={() => setSelectedAvatar(avatar.id)}
                            aria-label={`Select ${avatar.alt} avatar`}
                        >
                            <img src={avatar.src} alt = {avatar.alt} />
                        </button>
                    ))}
                </div>
            </div>

            <div className = "button_group">
                <button
                    type="button"
                    className={`button${isComplete ? '' : ' disabled'}`}
                    onClick={handleContinue}
                    disabled={!isComplete}
                    style={{ 
                        opacity: isComplete ? 1 : 0.5, 
                        pointerEvents: isComplete ? 'auto' : 'none' 
                    }}
                >
                    continue
                </button>
                <Link to={mode === 'host' ? "/" : "/join"} className = "button">back</Link>
            </div>
        </main>
    )
}