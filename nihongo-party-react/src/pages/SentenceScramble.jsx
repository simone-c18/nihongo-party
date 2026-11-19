import { useEffect, useState } from 'react'
import './SentenceScramble.css'
import RomajiText from "./RomajiText.jsx"

export const SCRAMBLE_PUZZLES = [
  {id:'scramble-1',english:'I drink water.',words:['のみます','わたしは','みずを'],answer:['わたしは','みずを','のみます'],hint:'は marks the topic, を marks the object, and the verb comes last.'},
  {id:'scramble-2',english:'I eat sushi.',words:['すしを','たべます','わたしは'],answer:['わたしは','すしを','たべます'],hint:'Put the topic first, then the food, then the verb.'},
  {id:'scramble-3',english:'This is a book.',words:['です','これは','ほん'],answer:['これは','ほん','です'],hint:'です ends a polite statement.'},
  {id:'scramble-4',english:'I go to school.',words:['がっこうに','いきます','わたしは'],answer:['わたしは','がっこうに','いきます'],hint:'に marks the destination; いきます means go.'},
  {id:'scramble-5',english:'I like cats.',words:['すきです','ねこが','わたしは'],answer:['わたしは','ねこが','すきです'],hint:'が marks the thing you like; すきです comes last.'},
]
export default function SentenceScramble({puzzle,index,total,score,players,myAnswer,answerCount,isHost,onSubmit,onNext,busy}) {
  const [selected,setSelected] = useState([])
  const [hint,setHint] = useState(false)
  useEffect(()=>{setSelected([]);setHint(false)},[puzzle.id])
  const finished = myAnswer !== undefined
  const allAnswered = players.length > 0 && answerCount === players.length
  const correct = puzzle.answer.join('|')
  return <main className="scramble-page">
    <header className="scramble-top"><strong>🌸 Nihongo Party</strong><span>MINIGAME 2 · {index+1}/{total}</span><strong>{score} pts</strong></header>
    <div className="scramble-layout"><aside className="scramble-guide"><img src="/assets/characters/kuromi.png" alt="Kuromi" onError={e=>{e.currentTarget.style.display='none'}}/><div className="scramble-speech"><strong>Kuromi ♡</strong><p>{finished?(myAnswer===correct?'Hmph! You got it right. Nice work! 💜':'Not bad! Learn the pattern for next time!'):'I mixed up these words! Think you can fix my sentence?'}</p></div></aside>
    <section className="scramble-card"><div className="scramble-kicker">💜 KUROMI'S SENTENCE SCRAMBLE</div><h1>Fix my sentence!</h1><p className="scramble-english">Translate: <strong>{puzzle.english}</strong></p>
    <div className="scramble-meter"><div style={{width:`${(index+1)/total*100}%`}}/></div>
    <div className="scramble-answer" aria-label="Your arranged sentence">{(finished?String(myAnswer).split('|'):selected).filter(Boolean).map((w,i)=><button key={`${w}-${i}`} disabled={finished||busy} onClick={()=>setSelected(s=>s.filter((_,j)=>i!==j))}>{w}{!finished?' ×':''}</button>)}{!finished&&!selected.length&&<span className="scramble-placeholder">Tap the tiles to build your sentence...</span>}</div>
    <div className="scramble-bank">{!finished&&puzzle.words.filter(w=>!selected.includes(w)).map(w=><button key={w} disabled={busy} onClick={()=>setSelected(s=>[...s,w])}><RomajiText text={w}/></button>)}</div>
    {!finished&&<div className="scramble-controls"><button className="scramble-clear" disabled={!selected.length||busy} onClick={()=>setSelected([])}>Clear</button><button className="scramble-check" disabled={selected.length!==puzzle.words.length||busy} onClick={()=>onSubmit(selected.join('|'))}>{busy?'Submitting...':'Check answer →'}</button></div>}
    {finished&&<div className={`scramble-feedback ${myAnswer===correct?'good':'retry'}`} role="status">{myAnswer===correct?'🌸 Correct! +100 points':<>Not quite! Correct order: <strong>{puzzle.answer.map((w,i)=><RomajiText key={i} text={w}/>)}</strong></>}</div>}
    <button className="scramble-hint" onClick={()=>setHint(s=>!s)}>{hint?'Hide grammar hint':'💡 Show grammar hint'}</button>{hint&&<p className="scramble-hint-text">{puzzle.hint}</p>}
    <p className="scramble-wait">{answerCount}/{players.length} players finished {finished&&!allAnswered?'· Waiting for classmates...':''}</p>
    {isHost&&index<total-1&&<button className="scramble-next" disabled={!allAnswered||busy} onClick={onNext}>Next puzzle →</button>}
    {isHost&&index===total-1&&allAnswered&&<p className="scramble-wait">Everyone finished! Opening results…</p>}
    {!isHost&&allAnswered&&index<total-1&&<p className="scramble-wait">Waiting for the host to continue…</p>}
    </section></div>
  </main>
}
