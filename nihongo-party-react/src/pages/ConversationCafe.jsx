import { useEffect, useState } from "react";
import "./ConversationCafe.css";

export const CAFE_SCENES = [
  { id:"cafe-1", speaker:"My Melody", japanese:"いらっしゃいませ！", translation:"Welcome!", prompt:"What should you say when greeting someone?", options:[{text:"こんにちは！",meaning:"Hello!",correct:true},{text:"おやすみなさい。",meaning:"Good night."},{text:"さようなら。",meaning:"Goodbye."}], reply:"こんにちは！ カフェへようこそ ♡" },
  { id:"cafe-2", speaker:"My Melody", japanese:"なにを のみますか？", translation:"What would you like to drink?", prompt:"Order water politely.", options:[{text:"みずを ください。",meaning:"Water, please.",correct:true},{text:"ねこが すきです。",meaning:"I like cats."},{text:"おなまえは？",meaning:"What's your name?"}], reply:"はい、みずですね！" },
  { id:"cafe-3", speaker:"My Melody", japanese:"ケーキは いかがですか？", translation:"Would you like some cake?", prompt:"Say 'Yes, please.'", options:[{text:"はい、おねがいします。",meaning:"Yes, please.",correct:true},{text:"いいえ、わたしは せんせいです。",meaning:"No, I am a teacher."},{text:"おはようございます。",meaning:"Good morning."}], reply:"どうぞ！ おいしいですよ ♡" },
  { id:"cafe-4", speaker:"My Melody", japanese:"おいしいですか？", translation:"Is it delicious?", prompt:"Tell My Melody that it's delicious.", options:[{text:"はい、おいしいです！",meaning:"Yes, it's delicious!",correct:true},{text:"いま なんじですか？",meaning:"What time is it?"},{text:"また あした。",meaning:"See you tomorrow."}], reply:"うれしい！ ありがとう ♡" },
  { id:"cafe-5", speaker:"My Melody", japanese:"ありがとうございました！", translation:"Thank you very much!", prompt:"Respond politely to her thanks.", options:[{text:"どういたしまして！",meaning:"You're welcome!",correct:true},{text:"みずを ください。",meaning:"Water, please."},{text:"こんばんは。",meaning:"Good evening."}], reply:"また きてね！ ♡" }
];
export default function ConversationCafe({ scene, index, total, score, players, myAnswer, answerCount, isHost, onSubmit, onNext, busy }) {
  const [picked,setPicked]=useState(null);
  useEffect(()=>setPicked(null),[scene.id]);
  const finished=myAnswer!==undefined;
  const allAnswered=players.length>0&&answerCount===players.length;
  const selected=finished?scene.options.find(o=>o.text===myAnswer):scene.options[picked];
  const correct=scene.options.find(o=>o.correct);
  return <main className="cafe-page">
    <header className="cafe-top"><strong>🌸 Nihongo Party</strong><span>MINIGAME 3 · SCENE {index+1}/{total}</span><strong>⭐ {score} pts</strong></header>
    <section className="cafe-scene">
      <div className="cafe-window"><span>☁️</span><span>🌸</span><span>☁️</span></div>
      <div className="cafe-sign">♡ My Melody's Conversation Café ♡</div>
      <div className="cafe-character">
        <img src="/assets/figma-74-22/assets/fdfb3.png" alt="My Melody" onError={e=>{e.currentTarget.style.display="none"}} />
      </div>
      <div className="cafe-dialogue" aria-live="polite">
        <div className="cafe-speaker">🎀 {scene.speaker}</div>
        <div className="cafe-japanese">{finished&&selected?.correct?scene.reply:scene.japanese}</div>
        <div className="cafe-translation">{finished&&selected?.correct?"My Melody is happy with your answer!":scene.translation}</div>
      </div>
    </section>
    <section className="cafe-panel">
      <div className="cafe-progress"><span style={{width:`${(index+1)/total*100}%`}} /></div>
      <h2>{scene.prompt}</h2>
      <div className="cafe-choices">{scene.options.map((option,i)=><button key={option.text} disabled={finished||busy} className={`${picked===i||myAnswer===option.text?"chosen":""} ${finished&&option.correct?"right":""}`} onClick={()=>setPicked(i)}><span className="cafe-choice-letter">{String.fromCharCode(65+i)}</span><span><strong>{option.text}</strong>{finished && <small>{option.meaning}</small>}</span></button>)}</div>
      {!finished&&<button className="cafe-submit" disabled={picked===null||busy} onClick={()=>onSubmit(scene.options[picked].text)}>{busy?"Sending...":"Say it! →"}</button>}
      {finished&&<div className={`cafe-feedback ${selected?.correct?"yes":"no"}`} role="status">{selected?.correct?"🌸 Lovely! +100 points":<>Not quite. A better reply is <strong>{correct.text}</strong></>}</div>}
      <p className="cafe-wait">{answerCount}/{players.length} players responded {finished&&!allAnswered?"· Waiting for classmates…":""}</p>
      {isHost&&index<total-1&&<button className="cafe-next" disabled={!allAnswered||busy} onClick={onNext}>Next café scene →</button>}
      {isHost&&index===total-1&&allAnswered&&<p className="cafe-wait">Everyone finished! Showing the leaderboard…</p>}
      {!isHost&&allAnswered&&index<total-1&&<p className="cafe-wait">Waiting for the host to continue…</p>}
    </section>
  </main>;
}
