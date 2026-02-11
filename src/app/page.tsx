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

const linkClass =
  "rounded-xl text-gray-800 py-4 px-5 sm:py-5 sm:px-6 bg-slate-200 border-2 border-slate-300 hover:bg-amber-100 hover:border-amber-200 inline-flex flex-row items-center justify-start gap-4 sm:gap-5 transition-colors min-h-[72px] sm:min-h-0 w-full hover:text-amber-700 transition-colors";

export default function Home() {
  return (
    <main className="flex flex-col w-full justify-center pt-16 mt-8 pb-16">
      <div className="w-full px-6 sm:px-8">
        <div className="text-center sm:text-left mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-[2.5rem] font-bold text-gray-800 mb-3">
            Examen de Educación Cívica
          </h1>
          <p className="text-gray-600">
            Practica para la entrevista de naturalización de Estados Unidos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-[5rem] items-center w-full">
          {/* Mobile: image first. Desktop: right column — image ~2x larger */}
          <div className="order-1 sm:order-2 flex justify-center items-center">
            <Image
              src={boyReading}
              width={560}
              alt="Person studying"
              className="w-[min(100%,290px)] sm:w-[min(100%,400px)] h-auto"
            />
          </div>

          {/* Mobile: buttons second. Desktop: left column — left-aligned with title */}
          <div className="order-2 sm:order-1 flex flex-col items-start w-full">
            <div className="flex flex-col gap-4 sm:gap-6 w-full">
              <Link href="/quiz" className={linkClass}>
                <QuizIcon />
                <span className="text-lg sm:text-xl font-semibold hover:text-amber-700 transition-colors">
                  Tomar Quiz
                </span>
              </Link>
              <Link href="/review" className={linkClass}>
                <ReviewIcon />
                <span className="text-lg sm:text-xl font-semibold">
                  Preguntas
                </span>
              </Link>
              <Link href="/flashcards" className={linkClass}>
                <FlashcardIcon />
                <span className="text-lg sm:text-xl font-semibold">
                  Revisar
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
