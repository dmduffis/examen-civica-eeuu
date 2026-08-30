"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";

type Props = {
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  onRepeatQuiz: () => void;
  onChooseAnother: () => void;
};

function getMessage(percentage: number): string {
  if (percentage === 100) return "¡Magnífico!";
  if (percentage >= 80) return "¡Bien hecho!";
  if (percentage >= 60) return "¡Vas por buen camino!";
  return "¡Sigue practicando, tú puedes!";
}

export default function Results({
  correctAnswers,
  incorrectAnswers,
  totalQuestions,
  onRepeatQuiz,
  onChooseAnother,
}: Props) {
  const correctPercentage =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;
  const incorrectPercentage = totalQuestions > 0 ? 100 - correctPercentage : 0;
  const message = getMessage(correctPercentage);

  useEffect(() => {
    if (correctPercentage !== 100) return;
    let cancelled = false;
    const duration = 2000;
    const end = Date.now() + duration;
    const frame = () => {
      if (cancelled) return;
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
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        confetti.reset();
      }
    };
    frame();

    return () => {
      cancelled = true;
      confetti.reset();
    };
  }, [correctPercentage]);

  return (
    <main className="flex flex-col w-full justify-center page-top pb-16 px-6 sm:px-8">
      {correctPercentage === 100 ? (
        <div className="flex justify-center mb-6 home-fade-in">
          <Image
            src="/illustration_celebration.png"
            width={1254}
            height={1254}
            alt="Celebrando"
            className="w-[min(100%,180px)] sm:w-[min(100%,280px)] h-auto object-contain"
            priority
          />
        </div>
      ) : correctPercentage >= 80 ? (
        <div className="flex justify-center mb-6 home-fade-in">
          <Image
            src="/illustration-mid.png"
            width={1254}
            height={1254}
            alt="Buen trabajo"
            className="w-[min(100%,180px)] sm:w-[min(100%,280px)] h-auto object-contain"
            priority
          />
        </div>
      ) : (
        <div className="flex justify-center mb-6 home-fade-in">
          <Image
            src="/illustration-encourage.png"
            width={1254}
            height={1254}
            alt="Ánimo, sigue practicando"
            className="w-[min(100%,180px)] sm:w-[min(100%,280px)] h-auto object-contain"
            priority
          />
        </div>
      )}

      <p className="text-5xl font-bold text-ink text-center page-title-in">
        {correctPercentage}%
      </p>
      <p
        className="text-brand-muted text-center text-sm mt-3 page-content-in"
        style={{ animationDelay: "0.1s" }}
      >
        {correctAnswers} de {totalQuestions} correctas
      </p>

      <div
        className="w-full max-w-xs mx-auto mt-8 page-content-in"
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
        className="page-heading text-center mt-6 page-title-in"
        style={{ animationDelay: "0.25s" }}
      >
        {message}
      </h1>

      <div
        className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center mt-12 max-w-sm mx-auto w-full page-content-in"
        style={{ animationDelay: "0.35s" }}
      >
        <button
          type="button"
          onClick={onRepeatQuiz}
          className="btn-tile py-4 px-6 font-semibold"
        >
          Repetir quiz
        </button>
        <button
          type="button"
          onClick={onChooseAnother}
          className="btn-tile py-4 px-6 font-semibold"
        >
          Elegir otro quiz
        </button>
      </div>
    </main>
  );
}
