'use client'

import React, {useEffect} from 'react'
import GradeBars from '../components/GradeBars';
import celebration from '../assets/images/quiz_100.png'
import Image from 'next/image';
import { useReward } from 'react-rewards';

type Props = {
    correctAnswers: number;
    incorrectAnswers: number;
    totalQuestions: number;
    restartQuiz: Function;
}

function Results(props: Props) {

const {correctAnswers, incorrectAnswers, totalQuestions, restartQuiz} = props;

const correctPercentage = Math.round((correctAnswers/totalQuestions) * 100)
const incorrectPercentage = Math.round((incorrectAnswers/totalQuestions) * 100)

const {reward} = useReward('rewardId', 'confetti')
useEffect(() => {
    if (correctPercentage === 100) {
        reward();
    }
}, [correctPercentage, reward])

if (correctPercentage === 100) {
    return (
        <main className='flex flex-col text-center w-full justify-center mt-24'>
        <h1 className='text-2xl font-semibold text-gray-800'>Magnifico!</h1>

        <div className='flex text-3xl text-center w-full justify-center'>
            <p className='text-4xl mt-2 text-center font-bold'>{correctPercentage}%</p>
        </div>
        <div className='flex justify-center mt-16'>
        <Image  src={celebration} width={400} alt='couple raising american flag and celebrating'/>
        </div>
        <span id='rewardId' />
    </main>
    )
}

  return (
    <main className='flex flex-col text-center w-full justify-center mt-24'>
        <h1 className='text-2xl font-semibold text-gray-800'>Tu Resultado:</h1>

        <div className='flex text-3xl text-center w-full justify-center'>
            <p className='text-4xl mt-2 text-center font-bold'>{correctPercentage}%</p>
        </div>

        <GradeBars correctPercentage={correctPercentage} incorrectPercentage={incorrectPercentage} />
        
        <div className='flex flex-row gap-6 mt-8 justify-center text-center text-lg'>
            <p>Correcto: <span className='font-bold'>{correctAnswers}</span></p>
            <p>Incorrecto: <span className='font-bold'>{incorrectAnswers}</span></p>
        </div>

        <div className='flex justify-center mt-16'>
        <button onClick={() => restartQuiz()} className='text-gray-900 py-2 px-4 bg-slate-200 border border-slate-300 text-underline hover:bg-yellow-500 rounded-lg'>Retome el Examen</button>
        </div>

  
    </main>
  )
}

export default Results