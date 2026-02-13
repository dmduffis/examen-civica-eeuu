import Image from "next/image";
import Link from "next/link";
import { FileText, BookOpen, Layers } from "lucide-react";
import boyReading from "./assets/images/quiz_start.png";

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
                <FileText size={48} className="shrink-0" aria-hidden />
                <span className="text-lg sm:text-xl font-semibold hover:text-amber-700 transition-colors">
                  Tomar Quiz
                </span>
              </Link>
              <Link href="/review" className={linkClass}>
                <BookOpen size={48} className="shrink-0" aria-hidden />
                <span className="text-lg sm:text-xl font-semibold">
                  Preguntas
                </span>
              </Link>
              <Link href="/flashcards" className={linkClass}>
                <Layers size={48} className="shrink-0" aria-hidden />
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
