"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import celebration from "../assets/images/quiz_100.png";

type Props = {
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  restartQuiz: () => void;
};

function getMessage(percentage: number): string {
  if (percentage === 100) return "¡Magnífico!";
  if (percentage >= 80) return "¡Bien hecho!";
  if (percentage >= 60) return "Casi.";
  return "Sigue practicando.";
}

export default function Results({
  correctAnswers,
  incorrectAnswers,
  totalQuestions,
  restartQuiz,
}: Props) {
  const correctPercentage =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;
  const incorrectPercentage = totalQuestions > 0 ? 100 - correctPercentage : 0;
  const message = getMessage(correctPercentage);

  useEffect(() => {
    if (correctPercentage !== 100) return;
    import("canvas-confetti").then(({ default: confetti }) => {
      const duration = 2000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    });
  }, [correctPercentage]);

  return (
    <main className="flex flex-col w-full justify-center pt-4 sm:pt-12 pb-16">
      {correctPercentage === 100 && (
        <div className="flex justify-center mb-6">
          <Image
            src={celebration}
            width={240}
            height={160}
            alt="Celebrando"
            className="object-contain"
          />
        </div>
      )}

      <p className="text-5xl font-bold text-gray-800 text-center">
        {correctPercentage}%
      </p>
      <p className="text-gray-500 text-center text-sm mt-3">
        {correctAnswers} de {totalQuestions} correctas
      </p>

      <div className="w-full max-w-xs mx-auto mt-8">
        <div className="flex h-2 overflow-hidden bg-slate-200">
          <div
            className="bg-green-500 transition-all duration-500"
            style={{ width: `${correctPercentage}%` }}
          />
          <div
            className="bg-red-400 transition-all duration-500"
            style={{ width: `${incorrectPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>{correctAnswers} correctas</span>
          <span>{incorrectAnswers} incorrectas</span>
        </div>
      </div>

      <h1 className="text-2xl font-semibold text-gray-800 text-center mt-6">
        {message}
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 max-w-sm mx-auto w-full">
        <button
          onClick={() => restartQuiz()}
          className="rounded-xl text-gray-800 py-4 px-6 bg-slate-200 border-2 border-slate-300 hover:bg-amber-100 hover:border-amber-200 font-semibold transition-colors"
        >
          Repetir quiz
        </button>
        <Link
          href="/quiz"
          className="rounded-xl text-gray-800 py-4 px-6 bg-slate-200 border-2 border-slate-300 hover:bg-amber-100 hover:border-amber-200 text-center font-semibold transition-colors"
        >
          Elegir otro quiz
        </Link>
      </div>
    </main>
  );
}
