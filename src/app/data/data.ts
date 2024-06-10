import { nanoid } from "nanoid"

export const data = [
    {
        id: 'qst01',
        questionText: '¿Cuál es la ley suprema de la nación?',
        answers: [
            {
                id: "answ001",
                answerText: 'El Código Penal',
                isCorrect: false,
            },
            {
                id: "answ011",
                answerText: 'La Constitución',
                isCorrect: true,
            },
            {
                id: "answ111",
                answerText: 'Las Leyes Municipales',
                isCorrect: false,
            },
            {
                id: "ans1111",
                answerText: 'El Reglamento Interno',
                isCorrect: false,
            }
        ]

    },
    {
        id: "qst02",
        questionText: 'Las primeras tres palabras de la Constitución contienen la idea del autogobierno (de que el pueblo se gobierna a sí mismo). ¿Cuáles son estas palabras?',
        answers: [
            {
                id: "answ002",
                answerText: 'El pueblo unido',
                isCorrect: false,
            },
            {
                id: "answ022",
                answerText: 'Libertad y justicia',
                isCorrect: false,
            },
            {
                id: "answ222",
                answerText: 'Nosotros, el pueblo',
                isCorrect: true,
            },
            {
                id: "ans2222",
                answerText: 'Poder del pueblo',
                isCorrect: false,
            }
        ]

    },
    {
        id: "qst03",
        questionText: '¿Con qué nombre se conocen las primeras diez enmiendas a la Constitución?',
        answers: [
            {
                id: "answ003",
                answerText: 'La Carta de Derechos',
                isCorrect: true,
            },
            {
                id: "answ033",
                answerText: 'La Declaración de Independencia',
                isCorrect: false,
            },
            {
                id: "answ333",
                answerText: 'Los Artículos Confederados',
                isCorrect: false,
            },
            {
                id: "ans3333",
                answerText: 'Las Resoluciones Federales',
                isCorrect: false,
            }
        ]

    },
    {
        id: "qst04",
        questionText: '¿Cuántas enmiendas tiene la Constitución?',
        answers: [
            {
                id: "ans4444",
                answerText: 'Diez (10)',
                isCorrect: false,
            },
            {
                id: "answ444",
                answerText: 'Veintisiete (27)',
                isCorrect: true,
            },
            {
                id: "answ044",
                answerText: 'Cincuenta (50)',
                isCorrect: false,
            },
            {
                id: "answ004",
                answerText: 'Cuarenta y dos (42)',
                isCorrect: false,
            }
        ]
    },
    {
        id: "qst05",
        questionText: '¿En qué consiste la libertad de religión?',
        answers: [
            {
                id: "ans5555",
                answerText: 'La obligación de seguir una religión específica.',
                isCorrect: false,
            },
            {
                id: "answ555",
                answerText: 'La capacidad de expresar opiniones políticas libremente.',
                isCorrect: false,
            },
            {
                id: "answ55",
                answerText: 'Se puede practicar cualquier religión o no practicar ninguna.',
                isCorrect: true,
            },
            {
                id: "answ005",
                answerText: 'La necesidad de asistir a servicios religiosos regularmente.',
                isCorrect: false,
            }
        ]
    },
    {
        id: "qst06",
        questionText: '¿Quién está a cargo de la rama ejecutiva?',
        answers: [
            {
                id: "ans6666",
                answerText: 'El Congreso',
                isCorrect: false,
            },
            {
                id: "answ666",
                answerText: 'El Presidente',
                isCorrect: true,
            },
            {
                id: "answ066",
                answerText: 'La Corte Suprema',
                isCorrect: true,
            },
            {
                id: "answ006",
                answerText: 'El Gobernador',
                isCorrect: false,
            }
        ]
    }
]