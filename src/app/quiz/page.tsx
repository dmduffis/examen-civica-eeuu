'use client'

import { nanoid } from 'nanoid'
import React, { useState, useEffect } from 'react'

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
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [randomArray, setRandomArray] = useState([]);
    const [questionSelected, setQuestionSelected] = useState<boolean>(false);

    const answersArray = data[questionIndex].answers

    const answerClasses = {
        correct: 'flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border border-green-500',
        incorrect: 'flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border border-red-200',
        default: 'flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border border-slate-300 hover:border-blue-700'
    }

    useEffect(() => {
        const shuffledAnswersArray = [...answersArray].sort(() => 0.5 - Math.random());
        setRandomArray(shuffledAnswersArray);
    }, []);

    const handleSelect = () => {
        setQuestionSelected(true);
    }

    

  return (
    <main className='flex flex-col w-full justify-center mt-16'>
        <div>
            <div>
                <p className='text-lg'>{data[questionIndex].questionText}</p>
            </div>

            {randomArray.map((answer) => {
               return (
                <div onClick={handleSelect} key={answer.id} className={questionSelected ? (answer.isCorrect ? answerClasses.correct : answerClasses.incorrect) : answerClasses.default }>
               <p>
                {answer.answerText}
               </p>
               <p className='text-sm text-green-400'>{questionSelected ? (answer.isCorrect ? 'respuesta correcta' : '') : ''}</p>
               </div>
               );
            })}
        </div>
    </main>
  )
}