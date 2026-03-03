"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FileText, XCircle } from "lucide-react";
import { useAuth } from "../lib/auth-context";
import { addQuizResult } from "../lib/profile-api";
import Image from "next/image";
import Link from "next/link";
import ProgressBar from "../components/ProgressBar";
import Results from "./Results";
import Question from "../components/Question";
import quizHero from "../assets/images/repasar.png";
import { BeatLoader } from "react-spinners";
import type { QuestionItem } from "../lib/question-types";
import { questionDisplayText } from "../lib/question-types";
import type { DisplayLang } from "../lib/question-types";
import { backendUrl } from "../lib/backend-url";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const QUIZ_SIZES = [10, 20, 50];

export default function QuizPage() {
  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>([]);
  const [data, setData] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [started, setStarted] = useState<boolean>(false);
  const [sortedAnswersArray, setSortedAnswersArray] = useState<
    QuestionItem["answers"]
  >([]);
  const [currentQuestionText, setCurrentQuestionText] = useState<string>("");
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [displayLang, setDisplayLang] = useState<DisplayLang>("es");
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
        const questionsRes = await axios.get(backendUrl("/api/question"), {
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
    setCurrentQuestionText(questionDisplayText(quizSet[0], displayLang));
    setSortedAnswersArray(shuffle(quizSet[0].answers));
    setQuestionIndex(0);
    setQuestionSubmitted(false);
    setQuestionSelected(null);
    setCurrentCorrect(null);
    setScore(0);
    setStarted(true);
  };

  const handleSelect = (item: QuestionItem["answers"][number], key: string) => {
    setQuestionSubmitted(true);
    setQuestionSelected(key);
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
      const next = data[questionIndex + 1];
      if (next) setCurrentQuestionText(questionDisplayText(next, displayLang));
      setSortedAnswersArray(shuffle(next.answers));
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
    if (
      !quizSubmitted ||
      !isAuthEnabled ||
      !user ||
      data.length === 0 ||
      savedResultRef.current
    )
      return;
    savedResultRef.current = true;
    const incorrect = data.length - score;
    addQuizResult(score, incorrect, data.length).catch(() => {});
  }, [quizSubmitted, isAuthEnabled, user, score, data.length]);

  useEffect(() => {
    if (data.length > 0 && questionIndex < data.length) {
      setCurrentQuestionText(
        questionDisplayText(data[questionIndex], displayLang),
      );
    }
  }, [displayLang, data, questionIndex]);

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
      <main className="flex flex-col w-full justify-center pt-6 mt-2 sm:pt-16 sm:mt-8 pb-16">
        {loading ? (
          <div className="flex min-h-[70vh] w-full flex-col items-center justify-center">
            <BeatLoader color="rgba(214, 169, 54, 0.6)" speedMultiplier={0.5} />
          </div>
        ) : (
          <div className="w-full px-6 sm:px-8">
            <div className="text-left mb-8 sm:mb-10">
              <h1 className="text-2xl sm:text-[2.5rem] font-bold text-gray-800 mb-3 leading-tight">
                Practica el Quiz
              </h1>
              <p className="text-gray-600">
                Elige todas las preguntas o un test al azar para prepararte para
                la entrevista de naturalización.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-8 sm:gap-[5rem] items-center w-full min-w-0">
              {/* Mobile: image first. Desktop: right column */}
              <div className="order-1 sm:order-2 flex justify-center items-center">
                <Image
                  src={quizHero}
                  width={quizHero.width}
                  height={quizHero.height}
                  alt="Person studying"
                  className="w-[min(100%,387px)] sm:w-[min(100%,532px)] h-auto object-contain"
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
                        <div className="flex flex-col gap-3 w-full">
                          <button
                            onClick={() => handleStart(null)}
                            className={`${rowClass} w-full`}
                          >
                            Todas las preguntas
                          </button>
                          {QUIZ_SIZES.filter((n) => n <= scorableCount).map(
                            (n) => (
                              <button
                                key={n}
                                onClick={() => handleStart(n)}
                                className={`${rowClass} w-full`}
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
      <main className="flex flex-col w-full justify-center mt-2 sm:mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText
              size={32}
              className="shrink-0 text-gray-700"
              aria-hidden
            />
            Quiz
          </h1>
          <button
            type="button"
            onClick={() => restartQuiz()}
            className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Salir"
          >
            <XCircle size={24} className="shrink-0" aria-hidden />
          </button>
        </div>
        <div>
          <ProgressBar progressPercentage={progressPercentage} />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="text-lg font-bold flex-1 min-w-0">
              {currentQuestionText}
            </p>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <button
                type="button"
                onClick={() => setDisplayLang("es")}
                className={`px-2 py-1 rounded ${displayLang === "es" ? "bg-amber-100 text-amber-800 font-medium" : "hover:bg-slate-100"}`}
              >
                ES
              </button>
              <span aria-hidden>|</span>
              <button
                type="button"
                onClick={() => setDisplayLang("en")}
                className={`px-2 py-1 rounded ${displayLang === "en" ? "bg-amber-100 text-amber-800 font-medium" : "hover:bg-slate-100"}`}
              >
                EN
              </button>
            </span>
          </div>

          {sortedAnswersArray.map((answer, idx) => {
            const answerKey = answer._id ?? `idx-${idx}`;
            return (
              <Question
                key={answerKey}
                answer={answer}
                answerKey={answerKey}
                displayLang={displayLang}
                handleSelect={(a) => handleSelect(a, answerKey)}
                questionSelected={questionSelected}
                answerClasses={answerClasses}
                questionSubmitted={questionSubmitted}
                currentCorrect={currentCorrect}
                feedbackClasses={feedbackClasses}
                loading={loading}
              />
            );
          })}

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
