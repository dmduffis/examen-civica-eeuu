"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../lib/auth-context";
import { addQuizResult } from "../lib/profile-api";
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
const QUESTIONS_API = "/api/questions";

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
  const { user, isAuthEnabled } = useAuth();
  const savedResultRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const questionsRes = await axios.get(QUESTIONS_API, {
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
    savedResultRef.current = false;
  };

  useEffect(() => {
    if (!quizSubmitted || !isAuthEnabled || !user || data.length === 0 || savedResultRef.current) return;
    savedResultRef.current = true;
    const incorrect = data.length - score;
    addQuizResult(score, incorrect, data.length).catch(() => {});
  }, [quizSubmitted, isAuthEnabled, user, score, data.length]);

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
      <main className="flex flex-col w-full justify-center pt-16 mt-8 pb-16">
        {loading ? (
          <div className="flex min-h-[70vh] w-full flex-col items-center justify-center">
            <BeatLoader color="rgba(214, 169, 54, 0.6)" speedMultiplier={0.5} />
          </div>
        ) : (
          <div className="w-full px-6 sm:px-8">
            <div className="text-center sm:text-left mb-8 sm:mb-10">
              <h1 className="text-2xl sm:text-[2.5rem] font-bold text-gray-800 mb-3">
                Practica el Quiz
              </h1>
              <p className="text-gray-600">
                Elige todas las preguntas o un test al azar para prepararte para
                la entrevista de naturalización.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-[5rem] items-center w-full">
              {/* Mobile: image first. Desktop: right column */}
              <div className="order-1 sm:order-2 flex justify-center items-center">
                <Image
                  src={girlExam}
                  width={560}
                  alt="Person studying"
                  className="w-[min(100%,290px)] sm:w-[min(100%,400px)] h-auto"
                />
              </div>

              {/* Mobile: options second. Desktop: left column */}
              <div className="order-2 sm:order-1 flex flex-col items-start w-full">
                <div className="flex flex-col gap-4 sm:gap-6 w-full">
                  {(() => {
                    const scorableCount = allQuestions.filter(
                      (q) => !q.isStateSpecific,
                    ).length;
                    const rowClass =
                      "rounded-xl text-gray-800 py-4 px-5 sm:py-5 sm:px-6 bg-slate-200 border-2 border-slate-300 hover:bg-amber-100 hover:border-amber-200 text-left text-lg sm:text-xl font-semibold transition-colors min-w-0";
                    return (
                      <>
                        <div className="w-full flex">
                          <button
                            onClick={() => handleStart(null)}
                            className={`${rowClass} flex-1`}
                          >
                            Todas las preguntas
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                          {QUIZ_SIZES.filter((n) => n <= scorableCount).map(
                            (n) => (
                              <button
                                key={n}
                                onClick={() => handleStart(n)}
                                className={`${rowClass} w-full sm:flex-1`}
                              >
                                {n} preguntas
                              </button>
                            ),
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Test al azar con 10, 20 o 50 preguntas
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
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
