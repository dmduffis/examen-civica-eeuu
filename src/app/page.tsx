import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FileText, BookOpen, Mic } from "lucide-react";
import boyReading from "./assets/images/quiz_start_hero.png";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Practica para la entrevista de naturalización de Estados Unidos. Accede al quiz, lista de preguntas, repaso con tarjetas y entrevista en audio.",
};

const FlashcardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-2 -2 28 28"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-full h-full shrink-0"
    aria-hidden
  >
    <rect
      x="2"
      y="4"
      width="14"
      height="18"
      rx="1.5"
      transform="rotate(-8 9 13)"
    />
    <rect
      x="8"
      y="0"
      width="14"
      height="18"
      rx="1.5"
      transform="rotate(8 15 9)"
    />
  </svg>
);

const linkClass =
  "rounded-xl text-gray-800 p-2 sm:p-3 bg-slate-200 border-2 border-slate-300 hover:bg-orange-100 hover:border-orange-200 flex flex-row sm:flex-col items-center justify-start sm:justify-center gap-3 sm:gap-2 transition-colors w-full min-w-0 overflow-hidden text-left sm:text-center min-h-[56px] sm:min-h-0 sm:aspect-square sm:max-h-40 sm:max-w-40";

export default function Home() {
  return (
    <main className="flex flex-col w-full justify-center pt-6 mt-2 sm:pt-16 sm:mt-8 pb-16">
      <div className="w-full min-w-0 px-6 sm:px-8">
        <div className="text-left mb-8 sm:mb-10 page-title-in">
          <h1 className="text-2xl sm:text-[2.5rem] font-bold text-[var(--title-blue)] mb-3 leading-tight">
            Examen de Educación Cívica
          </h1>
          <p className="text-gray-600">
            Practica para la entrevista de naturalización de Estados Unidos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,3fr)_minmax(0,4fr)] gap-8 sm:gap-[5rem] items-center w-full min-w-0 overflow-hidden">
          {/* Mobile: image first. Desktop: right column — image ~2x larger */}
          <div className="order-1 sm:order-2 flex justify-center sm:justify-start items-center min-w-0 home-fade-in" style={{ animationDelay: "0.15s" }}>
            <Image
              src={boyReading}
              width={560}
              alt="Person studying"
              className="w-[min(100%,320px)] sm:w-[min(100%,441px)] h-auto"
            />
          </div>

          {/* Mobile: stacked, icon left. Desktop: 4 squares, icon on top */}
          <div className="order-2 sm:order-1 w-full min-w-0 overflow-hidden">
            <div className="flex flex-col sm:grid sm:grid-cols-2 sm:grid-rows-2 sm:justify-items-start sm:items-center gap-3 sm:gap-4 w-full min-w-0 sm:max-w-[352px]">
              <Link href="/quiz" className={`${linkClass} opacity-0 home-slide-up`} style={{ animationDelay: "0.4s" }}>
                <FileText className="shrink-0 size-9 sm:size-10 md:size-11 lg:size-12" aria-hidden />
                <span className="text-sm sm:text-base font-semibold min-w-0 break-words leading-tight">
                  Tomar Quiz
                </span>
              </Link>
              <Link href="/preguntas" className={`${linkClass} opacity-0 home-slide-up`} style={{ animationDelay: "0.5s" }}>
                <BookOpen className="shrink-0 size-9 sm:size-10 md:size-11 lg:size-12" aria-hidden />
                <span className="text-sm sm:text-base font-semibold min-w-0 break-words leading-tight">
                  Preguntas
                </span>
              </Link>
              <Link href="/repasar" className={`${linkClass} opacity-0 home-slide-up`} style={{ animationDelay: "0.6s" }}>
                <span className="shrink-0 size-9 sm:size-10 md:size-11 lg:size-12 flex items-center justify-center">
                  <FlashcardIcon />
                </span>
                <span className="text-sm sm:text-base font-semibold min-w-0 break-words leading-tight">
                  Repasar
                </span>
              </Link>
              <Link href="/entrevista" className={`${linkClass} opacity-0 home-slide-up`} style={{ animationDelay: "0.7s" }}>
                <Mic className="shrink-0 size-9 sm:size-10 md:size-11 lg:size-12" aria-hidden />
                <span className="text-sm sm:text-base font-semibold min-w-0 break-words leading-tight">
                  Entrevista
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
