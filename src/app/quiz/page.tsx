"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import ProgressBar from "../components/ProgressBar";
import Results from "./Results";
import Question from "../components/Question";
import girlExam from "../assets/images/girl_exam.png";
import { BeatLoader } from "react-spinners";
type QuestionItem = {
  _id: string;
  questionText: string;
  answers: { _id: string; isCorrect: boolean; answerText: string }[];
  isStateSpecific?: boolean;
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const QUIZ_SIZES = [10, 20, 50];
const ENDPOINT =
  "https://examencivicabackend-production.up.railway.app/api/question/";

const QuizIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 shrink-0 text-gray-700"
  >
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

const ExitIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6 shrink-0"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9l-6 6M9 9l6 6" />
  </svg>
);

export default function QuizPage() {
  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>([]);
  const [data, setData] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [started, setStarted] = useState<boolean>(false);
  const [sortedAnswersArray, setSortedAnswersArray] = useState<
    { _id: string; isCorrect: boolean; answerText: string }[]
  >([]);
  const [currentQuestionText, setCurrentQuestionText] = useState<string>("");
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [questionSelected, setQuestionSelected] = useState<string | null>(null);
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [currentCorrect, setCurrentCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      try {
        const questionsRes = await axios.get(ENDPOINT, {
          headers: { "Content-Type": "application/json" },
        });
        setAllQuestions(questionsRes.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!started || data.length === 0 || !data[questionIndex]) return;
    const q = data[questionIndex];
    setCurrentQuestionText(q.questionText);
    setSortedAnswersArray(shuffle(q.answers));
  }, [started, questionIndex, data]);

  const progressPercentage = Math.round((questionIndex / data.length) * 100);

  const answerClasses = {
    correct:
      "flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border-2 border-green-500 rounded-lg",
    incorrect:
      "flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border-2 border-red-500 rounded-lg",
    default:
      "flex flex-row justify-between w-full p-4 items-center bg-white mt-4 border border-slate-300 hover:border-blue-700 rounded-lg",
    defaultAfter:
      "flex flex-row justify-between w-full p-4 items-center bg-gray-100 mt-4 border border-slate-300 rounded-lg",
  };

  const feedbackClasses = {
    submitted:
      "text-base font-semibold mt-4 mb-7 duration-1000 ease-in-out transition-all fade-in justify-right",
    default:
      "hidden font-semibold mt-4 mb-6 transition-all duration-500 ease-in-out fade-in justify-right",
  };

  const handleStart = async (count: number | null) => {
    const scorableQuestions = allQuestions.filter((q) => !q.isStateSpecific);
    const quizSet =
      count === null
        ? shuffle([...scorableQuestions])
        : shuffle([...scorableQuestions]).slice(
            0,
            Math.min(count, scorableQuestions.length),
          );
    setData(quizSet);
    setCurrentQuestionText(quizSet[0].questionText);
    setSortedAnswersArray(shuffle(quizSet[0].answers));
    setQuestionIndex(0);
    setQuestionSubmitted(false);
    setQuestionSelected(null);
    setCurrentCorrect(null);
    setScore(0);
    setStarted(true);
  };

  const handleSelect = (item: any) => {
    setQuestionSubmitted(true);
    setQuestionSelected(item._id);
    if (item.isCorrect) {
      setCurrentCorrect(true);
      setScore((prev) => prev + 1);
    } else {
      setCurrentCorrect(false);
    }
  };

  const handleNext = () => {
    if (questionIndex === data.length - 1) {
      setQuizSubmitted(true);
    } else {
      setQuestionIndex((prev) => prev + 1);
      setQuestionSubmitted(false);
      setQuestionSelected(null);
      setCurrentCorrect(null);
    }
  };

  const restartQuiz = () => {
    setData([]);
    setQuestionIndex(0);
    setScore(0);
    setQuizSubmitted(false);
    setQuestionSubmitted(false);
    setQuestionSelected(null);
    setCurrentCorrect(null);
    setStarted(false);
  };

  if (quizSubmitted) {
    return (
      <Results
        correctAnswers={score}
        incorrectAnswers={data.length - score}
        totalQuestions={data.length}
        restartQuiz={restartQuiz}
      />
    );
  } else {
    return !started ? (
      <main className="flex flex-col w-full justify-center mt-8">
        {loading ? (
          <div className="flex min-h-[70vh] w-full flex-col items-center justify-center">
            <BeatLoader color="rgba(214, 169, 54, 0.6)" speedMultiplier={0.5} />
          </div>
        ) : (
          <>
            <div className="w-full flex justify-start mb-4">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-800 hover:underline"
              >
                ← Inicio
              </Link>
            </div>
            <div className="flex justify-center mt-8">
              <Image src={girlExam} width={280} alt="Person studying" />
            </div>

            <h1 className="text-2xl font-semibold text-gray-800 text-center mt-8 mb-1">
              ¿Cuántas preguntas?
            </h1>
            <p className="text-gray-500 text-center text-sm mb-8">
              Quiz completo o un test al azar
            </p>

            <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
              {(() => {
                const scorableCount = allQuestions.filter(
                  (q) => !q.isStateSpecific,
                ).length;
                return (
                  <>
                    <button
                      onClick={() => handleStart(null)}
                      className="rounded-xl text-gray-800 py-5 px-6 bg-slate-200 border-2 border-slate-300 hover:bg-amber-100 hover:border-amber-200 text-lg font-semibold w-full transition-colors"
                    >
                      Todas — {scorableCount} preguntas
                    </button>
                    <div className="flex gap-3">
                      {QUIZ_SIZES.filter((n) => n <= scorableCount).map((n) => (
                        <button
                          key={n}
                          onClick={() => handleStart(n)}
                          className="rounded-xl text-gray-800 py-5 px-6 bg-slate-200 border-2 border-slate-300 hover:bg-amber-100 hover:border-amber-200 text-lg font-semibold flex-1 transition-colors"
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </>
                );
              })()}
              <p className="text-center text-xs text-gray-400">
                Test al azar con 10, 20 o 50 preguntas
              </p>
            </div>
          </>
        )}
      </main>
    ) : (
      <main className="flex flex-col w-full justify-center mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <QuizIcon />
            Quiz
          </h1>
          <button
            type="button"
            onClick={() => restartQuiz()}
            className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Salir"
          >
            <ExitIcon />
          </button>
        </div>
        <div>
          <ProgressBar progressPercentage={progressPercentage} />

          <div className="mt-6">
            <p className="text-lg font-bold mb-6">{currentQuestionText}</p>
          </div>

          {sortedAnswersArray.map(
            (
              answer: { _id: string; isCorrect: boolean; answerText: string },
              idx,
            ) => (
              <Question
                key={answer._id}
                answer={answer}
                handleSelect={handleSelect}
                questionSelected={questionSelected}
                answerClasses={answerClasses}
                questionSubmitted={questionSubmitted}
                currentCorrect={currentCorrect}
                feedbackClasses={feedbackClasses}
                loading={loading}
              />
            ),
          )}

          <div className="mt-6 flex flex-row items-center w-full text-sm justify-between">
            <p>
              Pregunta <span className="font-bold">{questionIndex + 1}</span> de{" "}
              {data.length}
            </p>

            <button
              onClick={() => handleNext()}
              className={
                questionSubmitted
                  ? "text-gray-900 py-2 px-4 bg-slate-200 rounded-lg hover:bg-yellow-500"
                  : "text-gray-400 py-2 px-4 bg-slate-200 rounded-lg"
              }
              disabled={!questionSubmitted}
            >
              {questionIndex === data.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      </main>
    );
  }
}
