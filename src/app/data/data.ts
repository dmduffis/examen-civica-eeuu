import { nanoid } from "nanoid"

export const data = [
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
        questionText: '¿Con qué nombre se conocen las primeras diez enmiendas a la Constitución?',
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
    },
    {
        id: nanoid(),
        questionText: '¿En qué consiste la libertad de religión?',
        answers: [
            {
                id: nanoid(),
                answerText: 'La obligación de seguir una religión específica.',
                isCorrect: false,
            },
            {
                id: nanoid(),
                answerText: 'La capacidad de expresar opiniones políticas libremente.',
                isCorrect: false,
            },
            {
                id: nanoid(),
                answerText: 'Se puede practicar cualquier religión o no practicar ninguna.',
                isCorrect: true,
            },
            {
                id: nanoid(),
                answerText: 'La necesidad de asistir a servicios religiosos regularmente.',
                isCorrect: false,
            }
        ]
    },
    {
        id: nanoid(),
        questionText: '¿Quién está a cargo de la rama ejecutiva?',
        answers: [
            {
                id: nanoid(),
                answerText: 'El Congreso',
                isCorrect: false,
            },
            {
                id: nanoid(),
                answerText: 'El Presidente',
                isCorrect: true,
            },
            {
                id: nanoid(),
                answerText: 'La Corte Suprema',
                isCorrect: true,
            },
            {
                id: nanoid(),
                answerText: 'El Gobernador',
                isCorrect: false,
            }
        ]
    }
]