import React from 'react'

type Props = {
    key: string,
    answer: { id: string, isCorrect: boolean, answerText: string},
    handleSelect: Function,
    questionSelected: string | null,
    answerClasses: any;
    questionSubmitted: boolean,
    currentCorrect: boolean | null,
    feedbackClasses: any;
}

function Question(props:Props) {
    const { answer, handleSelect, questionSelected, answerClasses, questionSubmitted, currentCorrect, feedbackClasses } = props;

  return (

    <div>
    
    <button 
    onClick={() => handleSelect(answer)} 
    className={questionSelected === answer.id ? (answer.isCorrect ? answerClasses.correct : answerClasses.incorrect) : (questionSubmitted ? answerClasses.defaultAfter : answerClasses.default)} disabled={questionSubmitted ? true : false}>
    
    <p>{answer.answerText}</p>
    
    <p className='text-sm font-semibold text-green-500'>{questionSubmitted? (currentCorrect ? "" : (answer.isCorrect ? 'respuesta correcta' : '')): ''}</p>
               </button>

    {questionSelected === answer.id ? (<p className={questionSubmitted ? feedbackClasses.submitted : feedbackClasses.default}>{questionSubmitted ? (currentCorrect ? 'Correcto! 👏' : 'Incorrecto 😥') : ''}</p>) : ''}
                </div>
    );
}

export default Question