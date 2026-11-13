import { useState } from 'react';
import { Link } from 'react-router-dom';
import Kuromi from '../assets/avatars/Kuromi_Full.png';
import SpeechBubble from '../assets/speech-bubble.png';


const QUESTIONS = [
    {id: 1, prompt: 'Cat', options: ['猫 (Neko)', '犬 (Inu)', '鳥 (Tori)', '魚 (Sakana)'], correct: 0 },
    {id: 2, prompt: 'Dog', options: ['猫 (Neko)', '犬 (Inu)', '兎 (Usagi)', '馬 (Uma)'], correct: 1 },
    {id: 3, prompt: 'Water', options: ['火 (Hi)', '水 (Mizu)', '木 (Ki)', '金 (Kane)'], correct: 1 },
];

export default function Game1() {
   const [currentIndex, setCurrentIndex] = useState(0);
   const [answers, setAnswers] = useState({});
   const [isSubmitted, setIsSubmitted] = useState(false);

   const currentQuestion = QUESTIONS[currentIndex];
   const selectedOption = answers[currentIndex] ?? null;
   const isLastQuestion = currentIndex === QUESTIONS.length - 1;
   
   const handleSelect = (optionIndex) => {
        if (isSubmitted) return;
        setAnswers((prev) => ({
            ...prev,
            [currentIndex]: optionIndex
        }));
   };

   const handleNextOrSubmit = () => {
        if (selectedOption == null) return;

        if (!isLastQuestion) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setIsSubmitted(true);
        }
   };



    return(
        <div className = "game1_page">
            <main className = "container">
                <div class = "game_card">
                    <div className = "speech_bubble">
                        <img src = {SpeechBubble} alt= "Speech Bubble" className = "speech_bubble_img"/>
                        <h3>Choose The Japanese <br></br> Word That Matches!</h3>
                        <img src = {Kuromi} alt = "Kuromi" className = "kuromi_sticker"/>
                    </div>
                    <div className= "question_header">
                        <h4>Question {currentIndex + 1} of {QUESTIONS.length}</h4>
                        <h1>{currentQuestion.prompt}</h1>
                    </div>

                    <div className = "game_options">
                        {currentQuestion.options.map((opt, i) => {
                            const letter = String.fromCharCode(65 + i);
                            const isSelected = selectedOption === i;

                            return(
                                <button key = {i} type = "button" className={`option_pill ${isSelected ? 'selected_option' : ''}`} onClick = {() => handleSelect(i)} disabled = {isSubmitted}>
                                    <span className = "option_letter">{letter}</span>
                                    <span className = "option_text">{opt}</span>
                                </button>
                            );
                        })}
                    </div>

                    {selectedOption !== null && !isSubmitted && (
                        <div className = "game_next">
                            <button type = "button" className = "button" onClick = {handleNextOrSubmit}> 
                                {isLastQuestion ? 'submit' : 'next question ->'}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
