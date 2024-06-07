'use client'

import { nanoid } from 'nanoid'
import React, { useState, useEffect } from 'react'
import Bar from '../components/Bar';

const data = [
    {
        id: nanoid(),
        questionText: '¿Cuál es la ley suprema de la nación?',
        answers: [
            {
                id: nanoid(),
                answerText: 'El Código Penal',
                isCorrect: false,
            },
            {
                id: nanoid(),
                answerText: 'La Constitución',
                isCorrect: true,
            },
            {
                id: nanoid(),
                answerText: 'Las Leyes Municipales',
                isCorrect: false,
            },
            {
                id: nanoid(),
                answerText: 'El Reglamento Interno',
                isCorrect: false,
            }
        ]

    },
    {
        id: nanoid(),
        questionText: 'Las primeras tres palabras de la Constitución contienen la idea del autogobierno (de que el pueblo se gobierna a sí mismo). ¿Cuáles son estas palabras?',
        answers: [
            {
                id: nanoid(),
                answerText: 'El pueblo unido',
                isCorrect: false,
            },
            {
                id: nanoid(),
                answerText: 'Libertad y justicia',
                isCorrect: false,
            },
            {
                id: nanoid(),
                answerText: 'Nosotros, el pueblo',
                isCorrect: true,
            },
            {
                id: nanoid(),
                answerText: 'Poder del pueblo',
                isCorrect: false,
            }
        ]

    },
    {
        id: nanoid(),
        questionText: 'Las primeras tres palabras de la Constitución contienen la idea del autogobierno (de que el pueblo se gobierna a sí mismo). ¿Cuáles son estas palabras?',
        answers: [
            {
                id: nanoid(),
                answerText: 'La Carta de Derechos',
                isCorrect: true,
            },
            {
                id: nanoid(),
                answerText: 'La Declaración de Independencia',
                isCorrect: false,
            },
            {
                id: nanoid(),
                answerText: 'Los Artículos Confederados',
                isCorrect: false,
            },
            {
                id: nanoid(),
                answerText: 'Las Resoluciones Federales',
                isCorrect: false,
            }
        ]

    },
    {
        id: nanoid(),
        questionText: '¿Cuántas enmiendas tiene la Constitución?',
        answers: [
            {
                id: nanoid(),
                answerText: 'Diez (10)',
                isCorrect: false,
            },
            {
                id: nanoid(),
                answerText: 'Veintisiete (27)',
                isCorrect: true,
            },
            {
                id: nanoid(),
                answerText: 'Cincuenta (50)',
                isCorrect: false,
            },
            {
                id: nanoid(),
                answerText: 'Cuarenta y dos (42)',
                isCorrect: false,
            }
        ]
    }
]

export default function Home() {

    const [started, setStarted] = useState<boolean>(false);
    const [questionIndex, setQuestionIndex] = useState<number>(0);
    const [QuizSubmitted, setQuizSubmitted] = useState<boolean>(false);
    const [randomArray, setRandomArray] = useState([]);
    const [questionSelected, setQuestionSelected] = useState<string | null>(null);
    const [questionSubmitted, setQuestionSubmitted ] = useState(false);
    const [currentCorrect, setCurrentCorrect] = useState<boolean | null>(null);

    

    const answersArray = data[questionIndex].answers

    const progressPercentage = Math.round((questionIndex / answersArray.length) * 100)

    const answerClasses = {
        correct: 'flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border border-green-500',
        incorrect: 'flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border border-red-500',
        default: 'flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border border-slate-300 hover:border-blue-700',
        defaultAfter: 'flex flex-row justify-between w-full p-4 items-center bg-gray-100 mt-4 border border-slate-300'
    }

    const remarkClasses = {
        submitted: 'text-base text-semibold mt-4 mb-8 duration-1000 ease-in-out transition-all fade-in justify-right',
        default: 'hidden text-semibold mt-4 mb-8 transition-all duration-500 ease-in-out fade-in justify-right'
    }

    useEffect(() => {
        const shuffledAnswersArray = [...answersArray].sort(() => 0.5 - Math.random());
        setRandomArray(shuffledAnswersArray);
    }, []);

    const handleSelect = (item) => {
        setQuestionSubmitted(true);
        setQuestionSelected(item.id);
    
        if (item.isCorrect) {
            setCurrentCorrect(true)
        } else {
            setCurrentCorrect(false)
        }
    } 

    const handleNext = () => {

    if (questionSubmitted && questionIndex < randomArray.length - 1)
    setQuestionIndex(prevIndex => prevIndex += 1)
    setQuestionSubmitted(false);
    setQuestionSelected(null);
    setCurrentCorrect(null)
    console.log(progressPercentage);
    }
    
    

  return (
    <main className='flex flex-col w-full justify-center mt-8'>
        <div>
            <Bar progressPercentage={progressPercentage}/>

            <div className='mt-8'>
                <p className='text-lg'>{data[questionIndex].questionText}</p>
            </div>

            {answersArray.map((answer) => {
               return (
                <>
                <button 
                onClick={() => handleSelect(answer)} key={answer.id}
                className={questionSelected === answer.id ? (answer.isCorrect ? answerClasses.correct : answerClasses.incorrect) : (questionSubmitted ? answerClasses.defaultAfter : answerClasses.default)} disabled={questionSubmitted ? true : false}>
               <p>
                {answer.answerText}
               </p>
               <p className='text-sm font-semibold text-green-400'>{questionSubmitted? (currentCorrect ? "" : (answer.isCorrect ? 'respuesta correcta' : '')): ''}</p>
               </button>

{questionSelected === answer.id ? (<p className={questionSubmitted ? remarkClasses.submitted : remarkClasses.default}>{questionSubmitted ? (currentCorrect ? 'Correcto! 👏' : 'Incorrecto 😥') : ''}</p>) : ''}
</>
               );
            })}

            <div className='mt-8 flex flex-row items-center w-full justify-between'>
            <p>Pregunta <span className='font-bold'>{questionIndex + 1}</span> de {answersArray.length}</p>

            <button onClick={() => handleNext()} className='text-gray-900 py-2 px-4 bg-slate-200' disabled={questionSubmitted? false: true}>Next</button>
            </div>
        </div>
    </main>
  )
}