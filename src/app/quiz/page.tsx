'use client'

import React, { useState, useEffect } from 'react'
import ProgressBar from '../components/ProgressBar';
import Results from './Results';
import boyReading from '../assets/images/quiz_start.png'
import Image from 'next/image';
import { data } from '../data/data'



export default function Home() {

    const [started, setStarted] = useState<boolean>(false);
    const [mainArray, setMainArray] = useState<Array<[]>>([])
    const [questionIndex, setQuestionIndex] = useState<number>(0);
    const [QuizSubmitted, setQuizSubmitted] = useState<boolean>(false);
    // const [randomArray, setRandomArray] = useState([]);
    const [questionSelected, setQuestionSelected] = useState<string | null>(null);
    const [questionSubmitted, setQuestionSubmitted ] = useState(false);
    const [currentCorrect, setCurrentCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState<number>(0);

    

    const answersArray = data[questionIndex].answers

    const progressPercentage = Math.round((questionIndex / answersArray.length) * 100)

    const answerClasses = {
        correct: 'flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border-2 border-green-500',
        incorrect: 'flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border-2 border-red-500',
        default: 'flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border border-slate-300 hover:border-blue-700',
        defaultAfter: 'flex flex-row justify-between w-full p-4 items-center bg-gray-100 mt-4 border border-slate-300'
    }

    const feedbackClasses = {
        submitted: 'text-base font-semibold mt-4 mb-7 duration-1000 ease-in-out transition-all fade-in justify-right',
        default: 'hidden font-semibold mt-4 mb-6 transition-all duration-500 ease-in-out fade-in justify-right'
    }

    // useEffect(() => {
    //     const shuffledAnswersArray = [...answersArray].sort(() => 0.5 - Math.random());
    //     setRandomArray(shuffledAnswersArray);
    // }, []);


    const handleSelect = (item:any) => {
        setQuestionSubmitted(true);
        setQuestionSelected(item.id);
    
        if (item.isCorrect) {
            setCurrentCorrect(true)
            setScore(prevScore => prevScore += 1)
        } else {
            setCurrentCorrect(false)
        }
    } 

    const handleStart = () => {
        setStarted(true);
    }

    const restartQuiz = () => {
        setQuestionIndex(0);
        setScore(0);
        setQuizSubmitted(false);
        setQuestionSubmitted(false);
        setQuestionSelected(null);
        setCurrentCorrect(null)
    }

    const handleNext = () => {

    if (questionSubmitted && questionIndex < answersArray.length - 1) {
    setQuestionIndex(prevIndex => prevIndex += 1)
    setQuestionSubmitted(false);
    setQuestionSelected(null);
    setCurrentCorrect(null)
    console.log(progressPercentage);
    } else {
        setQuizSubmitted(true);
    }
}

if (QuizSubmitted) {
    return (
<Results 
correctAnswers={score} 
incorrectAnswers={answersArray.length - score} 
totalQuestions={answersArray.length}
restartQuiz={restartQuiz}/>
 )

} else {
    
  return (

    !started ? 
    <main className='flex flex-col w-full justify-center mt-8'>

        <div className='flex justify-center mt-16'>
        <Image src={boyReading} width={400} alt='boy reading book'/>
        </div>

        <h1 className='text-3xl font-semibold text-gray-800 text-center mt-16'>Listo para el Quiz?</h1>

        <div className='flex justify-center mt-8'>
        <button onClick={() => handleStart()} className='text-gray-900 py-2 px-4 bg-slate-200 border border-slate-300 text-underline hover:border-blue-400'>Abra el Quiz</button>
        </div>

    </main>
    :
    <main className='flex flex-col w-full justify-center mt-8'>
        <div>
            <ProgressBar progressPercentage={progressPercentage}/>

            <div className='mt-6'>
                <p className='text-lg font-bold mb-6'>{data[questionIndex].questionText}</p>
            </div>

            {answersArray.map((answer) => {
               return (
                <>
                <button 
                onClick={() => handleSelect(answer)}
                key={answer.id}
                className={questionSelected === answer.id ? (answer.isCorrect ? answerClasses.correct : answerClasses.incorrect) : (questionSubmitted ? answerClasses.defaultAfter : answerClasses.default)} disabled={questionSubmitted ? true : false}>
               
               <p>
                {answer.answerText}
               </p>

               <p className='text-sm font-semibold text-green-500'>
                {questionSubmitted? (currentCorrect ? "" : (answer.isCorrect ? 'respuesta correcta' : '')): ''}
               </p>
               </button>

                {questionSelected === answer.id ? 
                (<p className={questionSubmitted ? feedbackClasses.submitted 
                : feedbackClasses.default}>{questionSubmitted ? 
                (currentCorrect ? 'Correcto! 👏' : 'Incorrecto 😥') : ''}</p>) : ''}
                </>
               );
            })}

            <div className='mt-8 flex flex-row items-center w-full text-sm justify-between'>
            <p>Pregunta <span className='font-bold'>{questionIndex + 1}</span> de {answersArray.length}</p>

            <button onClick={() => handleNext()} className='text-gray-900 py-2 px-4 bg-slate-200' disabled={questionSubmitted? false: true}>{questionIndex === answersArray.length -1 ? 'Submit' : 'Next'}</button>
            </div>
        </div>
    </main>
  )
}
}