import { toRomaji } from '../utils/romaji.js';
import './RomajiText.css';
export default function RomajiText({ text }) { return <span className="romaji-pair"><span className="romaji-japanese">{text}</span><small className="romaji-reading">{toRomaji(text)}</small></span> }
