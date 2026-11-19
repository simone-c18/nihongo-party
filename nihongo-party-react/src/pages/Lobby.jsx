import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { auth } from '../firebase/firebase.js';
import { claimCharacter, getCurrentPlayer, listenToRoom, setPlayerPosition, startGame } from '../firebase/roomcode.js';
import '../styles/sakuraLobby.css';

const AVATARS = [
  { id: 'my-melody', name: 'My Melody', symbol: '🎀', color: '#f8a9c6' },
  { id: 'kuromi', name: 'Kuromi', symbol: '🖤', color: '#b8a5dc' },
  { id: 'cinnamoroll', name: 'Cinnamoroll', symbol: '☁️', color: '#a5d8f2' },
  { id: 'pompompurin', name: 'Pompompurin', symbol: '🍮', color: '#f7d58a' }
];
const SPAWNS = [{ x: 24, y: 69 }, { x: 42, y: 75 }, { x: 62, y: 72 }, { x: 80, y: 65 }];
const SPEED = 20; // percentage of map per second
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export default function Lobby() {
  const { code } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState(auth.currentUser?.uid || null);
  const [myPosition, setMyPosition] = useState(null);
  const keys = useRef(new Set());
  const positionRef = useRef(null);
  const lastSync = useRef(0);
  const mapRef = useRef(null);

  useEffect(() => {
    getCurrentPlayer().then(user => setUserId(user.uid)).catch(err => setError(err.message));
  }, []);
  useEffect(() => {
    if (!code) { setError('Missing room code.'); setLoading(false); return; }
    return listenToRoom(code, data => {
      setRoom(data); setLoading(false);
      if (!data) setError('Room not found.');
    }, err => { setError(err.message); setLoading(false); });
  }, [code]);

  const players = Object.entries(room?.players || {});
  const isHost = Boolean(userId && room?.hostId === userId);
  const myAvatar = AVATARS.find(a => room?.characterClaims?.[a.id] === userId);
  const playerIndex = Math.max(0, players.findIndex(([id]) => id === userId));
  const spawn = SPAWNS[playerIndex % SPAWNS.length];
  const canMove = Boolean(myAvatar && room?.status === 'lobby' && room?.players?.[userId]);

  useEffect(() => {
    if (!canMove || !code || !userId) return;
    const fromServer = room?.positions?.[userId];
    const initial = fromServer || spawn;
    if (!positionRef.current) {
      positionRef.current = { ...initial };
      setMyPosition({ ...initial });
      setPlayerPosition(code, initial.x, initial.y).catch(err => setError(err.message));
    }
  }, [canMove, code, userId]);

  useEffect(() => {
    if (!canMove) return;
    const onDown = e => {
      if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement?.tagName)) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        e.preventDefault(); keys.current.add(e.key.toLowerCase());
      }
    };
    const onUp = e => keys.current.delete(e.key.toLowerCase());
    const onBlur = () => keys.current.clear();
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    let frame, last = performance.now();
    const tick = now => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      const k = keys.current;
      let dx = Number(k.has('arrowright') || k.has('d')) - Number(k.has('arrowleft') || k.has('a'));
      let dy = Number(k.has('arrowdown') || k.has('s')) - Number(k.has('arrowup') || k.has('w'));
      if ((dx || dy) && positionRef.current) {
        const magnitude = Math.hypot(dx, dy); dx /= magnitude; dy /= magnitude;
        const next = { x: clamp(positionRef.current.x + dx * SPEED * dt, 6, 94), y: clamp(positionRef.current.y + dy * SPEED * dt, 12, 91) };
        positionRef.current = next; setMyPosition(next);
        if (now - lastSync.current > 110) {
          lastSync.current = now;
          setPlayerPosition(code, next.x, next.y).catch(err => console.warn('Position sync:', err));
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); keys.current.clear(); window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); window.removeEventListener('blur', onBlur); };
  }, [canMove, code]);

  async function selectAvatar(id) {
    setBusy(true); setError('');
    try { await claimCharacter(code, id); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function begin() {
    setBusy(true); setError('');
    try { await startGame(code); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  function nudge(dx, dy) {
    if (!canMove) return;
    const p = positionRef.current || spawn;
    const next = { x: clamp(p.x + dx * 4, 6, 94), y: clamp(p.y + dy * 4, 12, 91) };
    positionRef.current = next; setMyPosition(next);
    setPlayerPosition(code, next.x, next.y).catch(err => setError(err.message));
  }

  if (loading) return <main className="sakura-screen">Loading Sakura School…</main>;
  if (error && !room) return <main className="sakura-screen"><p role="alert">{error}</p><Link to="/">Back home</Link></main>;
  return <main className="sakura-screen">
    <div className="sakura-shell">
      <header className="sakura-top"><div><span className="sakura-kicker">NIHONGO PARTY ✿</span><h1>さくら School Lobby</h1><p>Hang out together before class starts!</p></div><div className="sakura-code"><small>PARTY CODE</small><strong>{code}</strong><button onClick={() => navigator.clipboard?.writeText(code)}>Copy code</button></div></header>
      <div className="sakura-layout">
        <section className="sakura-room-panel">
          <div className="sakura-room-head"><span>🌸 Classroom 01</span><span className="sakura-live">● {players.length}/4 online</span></div>
          <div className="sakura-classroom" ref={mapRef} aria-label="Shared classroom game map">
            <div className="sakura-windows"><i/><i/><i/><i/></div>
            <div className="sakura-board">にほんご パーティー ✿</div>
            <div className="sakura-teacher">TEACHER'S DESK</div>
            {[0,1,2,3,4,5].map(i => <div key={i} className="sakura-desk" style={{ left: `${20 + (i%3)*27}%`, top: `${41 + Math.floor(i/3)*26}%` }}/>)
            {players.map(([id, player], index) => {
              const avatar = AVATARS.find(a => room?.characterClaims?.[a.id] === id);
              if (!avatar) return null;
              const p = id === userId ? (myPosition || room?.positions?.[id] || SPAWNS[index]) : (room?.positions?.[id] || SPAWNS[index]);
              return <div key={id} className={`sakura-player ${id === userId ? 'sakura-me' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%`, '--player-color': avatar.color }}><div className="sakura-player-icon">{avatar.symbol}</div><span>{player.nickname}{id === room.hostId ? ' ★' : ''}</span></div>;
            })}
            {!myAvatar && room.status === 'lobby' && <div className="sakura-pick-hint">Choose your character to enter the classroom! ↓</div>}
          </div>
          <div className="sakura-controls"><span>⌨️ Move with WASD / arrow keys</span><div className="sakura-dpad"><button aria-label="Move left" onClick={() => nudge(-1,0)}>←</button><button aria-label="Move up" onClick={() => nudge(0,-1)}>↑</button><button aria-label="Move down" onClick={() => nudge(0,1)}>↓</button><button aria-label="Move right" onClick={() => nudge(1,0)}>→</button></div></div>
        </section>
        <aside className="sakura-side">
          <section className="sakura-card"><h2>✿ Choose your friend</h2><p>Only one player can claim each character.</p><div className="sakura-avatar-grid">{AVATARS.map(a => { const owner = room?.characterClaims?.[a.id]; const mine = owner === userId; return <button key={a.id} disabled={busy || room.status !== 'lobby' || (owner && !mine)} className={`sakura-avatar ${mine ? 'selected' : ''}`} onClick={() => selectAvatar(a.id)} style={{ '--avatar-color': a.color }} aria-pressed={mine}><span>{a.symbol}</span><strong>{a.name}</strong><small>{mine ? 'YOURS ♡' : owner ? 'TAKEN' : 'SELECT'}</small></button>; })}</div></section>
          <section className="sakura-card"><h2>✿ Party members</h2><div className="sakura-members">{players.map(([id, p]) => { const a = AVATARS.find(a => room?.characterClaims?.[a.id] === id); return <div key={id} className="sakura-member"><span>{a?.symbol || '✨'}</span><strong>{p.nickname}</strong>{id === room.hostId && <small>HOST</small>}</div>; })}{Array.from({ length: Math.max(0, 4 - players.length) }, (_, i) => <div key={i} className="sakura-member empty"><span>＋</span><span>Waiting for a friend…</span></div>)}</div></section>
          {room.status === 'playing' ? <div className="sakura-status">🎮 Game started! Minigame screen is the next integration step.</div> : isHost ? <button className="sakura-start" disabled={busy || players.length < 2} onClick={begin}>▶ START GAME</button> : <div className="sakura-status">⏳ Waiting for the host to start…</div>}
          {isHost && room.status === 'lobby' && players.length < 2 && <small className="sakura-note">Invite at least one friend to start.</small>}
          {error && <p role="alert" className="sakura-error">{error}</p>}
          <Link className="sakura-home" to="/">← Back to home</Link>
        </aside>
      </div>
    </div>
  </main>;
}
