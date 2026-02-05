import Image from "next/image";
import Link from "next/link";
import boyReading from "./assets/images/quiz_start.png";

const QuizIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-12 h-12 shrink-0"
  >
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

const ReviewIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-12 h-12 shrink-0"
  >
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
  </svg>
);

const FlashcardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-2 -2 28 28"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-12 h-12 shrink-0"
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

export default function Home() {
  return (
    <main className="flex flex-col w-full justify-center pt-16 mt-8">
      <div className="flex justify-center mb-8">
        <Image src={boyReading} width={280} alt="Person studying" />
      </div>
      <h1 className="text-3xl font-semibold text-gray-800 text-center mb-3">
        Examen de Educación Cívica
      </h1>
      <p className="text-gray-600 text-center mb-10 max-w-lg mx-auto">
        Practica para la entrevista de naturalización de Estados Unidos.
      </p>

      <div className="flex flex-col sm:flex-row flex-wrap gap-6 justify-center">
        <Link
          href="/quiz"
          className="rounded-xl text-gray-800 py-8 px-10 bg-slate-200 border-2 border-slate-300 hover:bg-amber-100 hover:border-amber-200 w-44 sm:w-52 text-center inline-flex flex-col items-center justify-center gap-4 transition-colors"
        >
          <QuizIcon />
          <span className="text-xl font-semibold">Tomar Quiz</span>
        </Link>
        <Link
          href="/review"
          className="rounded-xl text-gray-800 py-8 px-10 bg-slate-200 border-2 border-slate-300 hover:bg-amber-100 hover:border-amber-200 w-44 sm:w-52 text-center inline-flex flex-col items-center justify-center gap-4 transition-colors"
        >
          <ReviewIcon />
          <span className="text-xl font-semibold">Preguntas</span>
        </Link>
        <Link
          href="/flashcards"
          className="rounded-xl text-gray-800 py-8 px-10 bg-slate-200 border-2 border-slate-300 hover:bg-amber-100 hover:border-amber-200 w-44 sm:w-52 text-center inline-flex flex-col items-center justify-center gap-4 transition-colors"
        >
          <FlashcardIcon />
          <span className="text-xl font-semibold">Revisar</span>
        </Link>
      </div>
    </main>
  );
}
