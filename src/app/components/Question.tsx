import React from "react";
import type { QuestionAnswer } from "../lib/question-types";
import { answerDisplayText } from "../lib/question-types";

type Props = {
  answer: QuestionAnswer;
  answerKey: string;
  displayLang: "es" | "en";
  handleSelect: (answer: QuestionAnswer) => void;
  questionSelected: string | null;
  answerClasses: { correct: string; incorrect: string; default: string; defaultAfter: string };
  questionSubmitted: boolean;
  currentCorrect: boolean | null;
  feedbackClasses: { submitted: string; default: string };
  loading: boolean;
};

function Question(props: Props) {
  const {
    answer,
    answerKey,
    displayLang,
    handleSelect,
    questionSelected,
    answerClasses,
    questionSubmitted,
    currentCorrect,
    feedbackClasses,
  } = props;

  const displayText = answerDisplayText(answer, displayLang);
  const isSelected = questionSelected === answerKey;

  return (
    <div>
      <button
        type="button"
        onClick={() => handleSelect(answer)}
        className={
          isSelected
            ? answer.isCorrect
              ? answerClasses.correct
              : answerClasses.incorrect
            : questionSubmitted
              ? answerClasses.defaultAfter
              : answerClasses.default
        }
        disabled={questionSubmitted}
      >
        <p>{displayText}</p>
        <span className="text-green-500 shrink-0">
          {questionSubmitted && !currentCorrect && answer.isCorrect ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : null}
        </span>
      </button>
      {isSelected ? (
        <p className={questionSubmitted ? feedbackClasses.submitted : feedbackClasses.default}>
          {questionSubmitted ? (currentCorrect ? "Correcto! 👏" : "Incorrecto 😥") : ""}
        </p>
      ) : null}
    </div>
  );
}

export default Question;