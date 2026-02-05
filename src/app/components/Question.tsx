import React from 'react'

type Props = {
    key: string,
    answer: { _id: string, isCorrect: boolean, answerText: string},
    handleSelect: Function,
    questionSelected: string | null,
    answerClasses: any;
    questionSubmitted: boolean,
    currentCorrect: boolean | null,
    feedbackClasses: any;
    loading: boolean;
}

function Question(props:Props) {
    const { answer, handleSelect, questionSelected, answerClasses, questionSubmitted, currentCorrect, feedbackClasses} = props;

  return (

    (<div>
    
    <button 
    onClick={() => handleSelect(answer)} 
    className={questionSelected === answer._id ? (answer.isCorrect ? answerClasses.correct : answerClasses.incorrect) : (questionSubmitted ? answerClasses.defaultAfter : answerClasses.default)} disabled={questionSubmitted ? true : false}>
    
    <p>{answer.answerText}</p>
    
    <span className="text-green-500 shrink-0">
      {questionSubmitted && !currentCorrect && answer.isCorrect ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <path d="M22 4L12 14.01l-3-3" />
        </svg>
      ) : null}
    </span>
               </button>

    {questionSelected === answer._id ? (<p className={questionSubmitted ? feedbackClasses.submitted : feedbackClasses.default}>{questionSubmitted ? (currentCorrect ? 'Correcto! 👏' : 'Incorrecto 😥') : ''}</p>) : ''}
                </div>)
    );
}

export default Question