import React from "react";
import { Check } from "lucide-react";
import type { QuestionAnswer } from "../lib/question-types";
import { answerDisplayText } from "../lib/question-types";

type Props = {
  answer: QuestionAnswer;
  answerKey: string;
  displayLang: "es" | "en";
  handleSelect: (answer: QuestionAnswer) => void;
  questionSelected: string | null;
  answerClasses: {
    correct: string;
    incorrect: string;
    default: string;
    defaultAfter: string;
  };
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
            : questionSubmitted && answer.isCorrect
              ? answerClasses.correct
              : questionSubmitted
                ? answerClasses.defaultAfter
                : answerClasses.default
        }
        disabled={questionSubmitted}
      >
        <p>{displayText}</p>
        <span className="text-green-500 shrink-0">
          {questionSubmitted && !currentCorrect && answer.isCorrect ? (
            <Check size={24} className="shrink-0" aria-hidden />
          ) : null}
        </span>
      </button>
      {isSelected ? (
        <p
          className={
            questionSubmitted
              ? feedbackClasses.submitted
              : feedbackClasses.default
          }
        >
          {questionSubmitted
            ? currentCorrect
              ? displayLang === "en"
                ? "Correct! 👏"
                : "Correcto! 👏"
              : displayLang === "en"
                ? "Incorrect 😥"
                : "Incorrecto 😥"
            : ""}
        </p>
      ) : null}
    </div>
  );
}

export default Question;
