import { Link } from 'react-router-dom'
import landing from '../assets/landing.png'

export default function Landing() {
  return (
    <main className="container">
      <h1>nihongo party</h1>
      <h3>the fun way to learn Japanese!</h3>
      <img src={landing} alt="Two Animated Bears" />

      <div className="button_group">
        <Link to="/lobby" className="button">host game</Link>
        <Link to="/join" className="button">join room</Link>
      </div>
    </main>
  )
}
