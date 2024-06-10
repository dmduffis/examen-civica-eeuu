'use client'

import React, { useState } from 'react'
import { data } from '../data/data'
import Image from 'next/image';
import ProgressBar from '../components/ProgressBar';
import Results from './Results';
import Question from '../components/Question';
import boyReading from '../assets/images/quiz_start.png';

export default function Home() {

    const [started, setStarted] = useState<boolean>(false);
    const [questionIndex, setQuestionIndex] = useState<number>(0);
    const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
    const [questionSelected, setQuestionSelected] = useState<string | null>(null);
    const [questionSubmitted, setQuestionSubmitted ] = useState(false);
    const [currentCorrect, setCurrentCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState<number>(0);

    const question = data[questionIndex]
    const answersArray = question.answers;
    const currentQuestionText = question.questionText;

    const progressPercentage = Math.round((questionIndex / answersArray.length) * 100)

    const answerClasses = {
        correct: 'flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border-2 border-green-500 rounded-lg',
        incorrect: 'flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border-2 border-red-500 rounded-lg',
        default: 'flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border border-slate-300 hover:border-blue-700 rounded-lg',
        defaultAfter: 'flex flex-row justify-between w-full p-4 items-center bg-gray-100 mt-4 border border-slate-300 rounded-lg'
    }

    const feedbackClasses = {
        submitted: 'text-base font-semibold mt-4 mb-7 duration-1000 ease-in-out transition-all fade-in justify-right',
        default: 'hidden font-semibold mt-4 mb-6 transition-all duration-500 ease-in-out fade-in justify-right'
    }

    const handleStart = () => {
        setStarted(true);
    }

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

    const handleNext = () => {

    if (questionIndex === answersArray.length -1) {
        setQuizSubmitted(true) 
    } else {
        setQuestionIndex(prevIndex => prevIndex += 1)
        setQuestionSubmitted(false);
        setQuestionSelected(null);
        setCurrentCorrect(null)
    }  
}

const restartQuiz = () => {
    setQuestionIndex(0);
    setScore(0);
    setQuizSubmitted(false);
    setQuestionSubmitted(false);
    setQuestionSelected(null);
    setCurrentCorrect(null)
}

if (quizSubmitted) {
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
        <button onClick={() => handleStart()} className='rounded-lg text-gray-900 py-2 px-4 bg-slate-200 border border-slate-300 text-underline hover:bg-yellow-500'>Abra el Quiz</button>
        </div>

    </main>
    : 
    <main className='flex flex-col w-full justify-center mt-8'>
        <div>
            <ProgressBar progressPercentage={progressPercentage}/>

            <div className='mt-6'>
                <p className='text-lg font-bold mb-6'>{currentQuestionText}</p>
            </div>

            {answersArray.map((answer:{ id:string, isCorrect:boolean, answerText:string }) => {
               return (<Question
               key={answer.id} 
               answer={answer} 
               handleSelect={handleSelect} 
               questionSelected={questionSelected}
               answerClasses={answerClasses}
               questionSubmitted={questionSubmitted}
               currentCorrect={currentCorrect}
               feedbackClasses={feedbackClasses}
               />)
            })}

            <div className='mt-6 flex flex-row items-center w-full text-sm justify-between'>
            <p>Pregunta <span className='font-bold'>{questionIndex + 1}</span> de {answersArray.length}</p>

            <button onClick={() => handleNext()} className={questionSubmitted ? 'text-gray-900 py-2 px-4 bg-slate-200 rounded-lg hover:bg-yellow-500' : 'text-gray-400 py-2 px-4 bg-slate-200 rounded-lg'} disabled={questionSubmitted? false : true}>{questionIndex === answersArray.length -1 ? 'Submit' : 'Next'}</button>
            </div>
        </div>
    </main>
  )
}
}