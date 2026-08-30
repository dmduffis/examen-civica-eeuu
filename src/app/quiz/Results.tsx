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
    <main className="flex flex-col w-full justify-center page-top pb-16">
      {correctPercentage === 100 && (
        <div className="flex justify-center mb-6 home-fade-in">
          <Image
            src={celebration}
            width={240}
            height={160}
            alt="Celebrando"
            className="object-contain"
          />
        </div>
      )}

      <p className="text-5xl font-bold text-ink text-center page-title-in">
        {correctPercentage}%
      </p>
      <p
        className="text-brand-muted text-center text-sm mt-3 page-content-in opacity-0"
        style={{ animationDelay: "0.1s" }}
      >
        {correctAnswers} de {totalQuestions} correctas
      </p>

      <div
        className="w-full max-w-xs mx-auto mt-8 page-content-in opacity-0"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex h-2 overflow-hidden bg-white">
          <div
            className="bg-green-500 transition-all duration-500"
            style={{ width: `${correctPercentage}%` }}
          />
          <div
            className="bg-red-400 transition-all duration-500"
            style={{ width: `${incorrectPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-brand-muted">
          <span>{correctAnswers} correctas</span>
          <span>{incorrectAnswers} incorrectas</span>
        </div>
      </div>

      <h1
        className="page-heading text-center mt-6 page-title-in opacity-0"
        style={{ animationDelay: "0.25s" }}
      >
        {message}
      </h1>

      <div
        className="flex flex-col sm:flex-row gap-4 justify-center mt-12 max-w-sm mx-auto w-full page-content-in opacity-0"
        style={{ animationDelay: "0.35s" }}
      >
        <button
          onClick={() => restartQuiz()}
          className="btn-tile py-4 px-6 font-semibold"
        >
          Repetir quiz
        </button>
        <Link
          href="/quiz"
          className="btn-tile py-4 px-6 text-center font-semibold"
        >
          Elegir otro quiz
        </Link>
      </div>
    </main>
  );
}
