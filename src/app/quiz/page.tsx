"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { XCircle } from "lucide-react";
import { useAuth } from "../lib/auth-context";
import { addQuizResult } from "../lib/profile-api";
import Image from "next/image";
import Link from "next/link";
import ProgressBar from "../components/ProgressBar";
import Results from "./Results";
import Question from "../components/Question";
import { BeatLoader } from "react-spinners";
import type { QuestionItem } from "../lib/question-types";
import { questionDisplayText } from "../lib/question-types";
import type { DisplayLang } from "../lib/question-types";
import { backendUrl } from "../lib/backend-url";
import LangSelect from "../components/LangSelect";
import PageHeadingWithIcon from "../components/PageHeadingWithIcon";
import QuestionsLoadError from "../components/QuestionsLoadError";

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
  const [error, setError] = useState<string | null>(null);
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
  const [lastQuizCount, setLastQuizCount] = useState<number | null>(null);
  const { user, isAuthEnabled } = useAuth();
  const savedResultRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const questionsRes = await axios.get(backendUrl("/api/question"), {
          headers: { "Content-Type": "application/json" },
        });
        setAllQuestions(questionsRes.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setAllQuestions([]);
        setError(
          "No se pudieron cargar las preguntas. Comprueba tu conexión e inténtalo más tarde.",
        );
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
      "btn-tile-gray flex flex-row justify-between w-full p-4 items-center mt-4 !border-green-500 disabled:!opacity-100",
    incorrect:
      "btn-tile-gray flex flex-row justify-between w-full p-4 items-center mt-4 !border-red-500 disabled:!opacity-100",
    default:
      "btn-tile-gray flex flex-row justify-between w-full p-4 items-center mt-4",
    defaultAfter:
      "btn-tile-gray flex flex-row justify-between w-full p-4 items-center mt-4",
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
    setLastQuizCount(count);
    setData(quizSet);
    setCurrentQuestionText(questionDisplayText(quizSet[0], displayLang));
    setSortedAnswersArray(shuffle(quizSet[0].answers));
    setQuestionIndex(0);
    setQuestionSubmitted(false);
    setQuestionSelected(null);
    setCurrentCorrect(null);
    setScore(0);
    setQuizSubmitted(false);
    setStarted(true);
    savedResultRef.current = false;
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

  /** Back to size picker */
  const chooseAnotherQuiz = () => {
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

  /** Same length, new shuffle */
  const repeatQuiz = () => {
    handleStart(lastQuizCount);
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
        onRepeatQuiz={repeatQuiz}
        onChooseAnother={chooseAnotherQuiz}
      />
    );
  }

  if (error && !loading) {
    return (
      <QuestionsLoadError
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return !started ? (
    <main className="flex flex-col w-full justify-center page-top pb-16">
      {loading ? (
        <div className="flex min-h-[70vh] w-full flex-col items-center justify-center">
          <BeatLoader color="rgba(214, 169, 54, 0.6)" speedMultiplier={0.5} />
        </div>
      ) : (
        <div className="w-full px-6 sm:px-8">
          <div className="w-full mb-0 page-title-in">
            <PageHeadingWithIcon
              iconSrc="/icon_quiz_practice.png"
              title="Practica el Quiz"
              subtitle="Elige todas las preguntas o un test al azar para prepararte para la entrevista de naturalización."
              priority
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-8 sm:gap-[5rem] items-center w-full min-w-0">
            {/* Mobile: image first. Desktop: right column */}
            <div
              className="order-1 sm:order-2 flex justify-center items-center home-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <Image
                src="/illustration_practice_quiz.png"
                width={1448}
                height={1086}
                alt="Person studying for the US civics quiz"
                className="w-[min(100%,220px)] sm:w-[min(100%,532px)] h-auto object-contain"
                priority
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
                    "btn-tile py-4 px-5 sm:py-5 sm:px-6 text-left text-lg sm:text-xl min-w-0 page-content-in";
                  return (
                    <>
                      <div className="flex flex-col gap-3 w-full">
                        <button
                          onClick={() => handleStart(null)}
                          className={`${rowClass} w-full opacity-0`}
                          style={{ animationDelay: "0.2s" }}
                        >
                          Todas las preguntas
                        </button>
                        {QUIZ_SIZES.filter((n) => n <= scorableCount).map(
                          (n, i) => (
                            <button
                              key={n}
                              onClick={() => handleStart(n)}
                              className={`${rowClass} w-full opacity-0`}
                              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                            >
                              {n} preguntas
                            </button>
                          ),
                        )}
                      </div>
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
    <main className="flex flex-col w-full justify-center page-top pb-16">
      <div className="w-full px-6 sm:px-8">
        <div className="flex justify-between items-center gap-3 mb-6">
          <h1 className="page-heading min-w-0">Quiz</h1>
          <div className="flex shrink-0 items-center gap-2">
            <LangSelect value={displayLang} onChange={setDisplayLang} />
            <button
              type="button"
              onClick={() => chooseAnotherQuiz()}
              className="text-brand-muted hover:text-ink p-1 rounded-full hover:bg-coral-soft transition-colors"
              aria-label="Salir"
            >
              <XCircle size={32} className="shrink-0" aria-hidden />
            </button>
          </div>
        </div>
        <div>
          <ProgressBar progressPercentage={progressPercentage} />

          <p className="mt-6 text-lg font-bold">{currentQuestionText}</p>

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
              {displayLang === "en" ? (
                <>
                  Question{" "}
                  <span className="font-bold">{questionIndex + 1}</span> of{" "}
                  {data.length}
                </>
              ) : (
                <>
                  Pregunta{" "}
                  <span className="font-bold">{questionIndex + 1}</span> de{" "}
                  {data.length}
                </>
              )}
            </p>

            <button
              onClick={() => handleNext()}
              className={
                questionSubmitted
                  ? "btn-brand py-2 px-4"
                  : "btn-tile py-2 px-4 opacity-50 cursor-not-allowed"
              }
              disabled={!questionSubmitted}
            >
              {questionIndex === data.length - 1
                ? displayLang === "en"
                  ? "Submit"
                  : "Enviar"
                : displayLang === "en"
                  ? "Next"
                  : "Siguiente"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
