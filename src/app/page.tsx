import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  FileAudio,
  FilePenLine,
  FileSearch,
  FileText,
} from "lucide-react";
import boyReading from "./assets/images/quiz_start_hero.png";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Practica para la entrevista de naturalización de Estados Unidos. Accede al quiz, lista de preguntas, repaso con tarjetas y entrevista en audio.",
};

const navRows: {
  href: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    href: "/quiz",
    title: "Tomar Quiz",
    description:
      "Pon a prueba lo que sabes con todas las preguntas o un test al azar.",
    Icon: FileText,
  },
  {
    href: "/preguntas",
    title: "Preguntas",
    description:
      "Recorre las 100 preguntas con las respuestas correctas y tu estado.",
    Icon: FileSearch,
  },
  {
    href: "/repasar",
    title: "Repasar",
    description:
      "Repasa con tarjetas y marca las que ya tienes claras.",
    Icon: FilePenLine,
  },
  {
    href: "/entrevista",
    title: "Entrevista",
    description:
      "Practica la parte oral del examen con preguntas en audio.",
    Icon: FileAudio,
  },
];

const iconClass = "size-7 lg:size-8";

export default function Home() {
  return (
    <main className="flex flex-col w-full items-center justify-center pt-6 mt-2 sm:pt-16 sm:mt-8 pb-16 lg:items-stretch">
      <div className="w-full min-w-0 px-6 sm:px-8">
        <div className="page-title-in mx-auto mb-8 max-w-xl text-center sm:mb-10 lg:mx-0 lg:max-w-none lg:text-left">
          <h1 className="page-heading mb-3">
            Examen de Educación Cívica
          </h1>
          <p className="text-gray-600">
            Practica para la entrevista de naturalización de Estados Unidos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)] gap-8 lg:gap-[5rem] items-center justify-items-center w-full min-w-0 overflow-hidden lg:justify-items-stretch">
          <div className="order-1 lg:order-2 flex w-full justify-center lg:justify-start items-center min-w-0 max-w-md lg:max-w-none home-fade-in" style={{ animationDelay: "0.15s" }}>
            <Image
              src={boyReading}
              width={560}
              alt="Person studying"
              className="w-[min(100%,320px)] lg:w-[min(100%,441px)] h-auto"
            />
          </div>

          <div className="order-2 lg:order-1 flex w-full min-w-0 justify-center overflow-hidden lg:justify-start">
            <nav aria-label="Principales secciones" className="flex w-full max-w-xl flex-col gap-3 lg:w-full">
              {navRows.map(({ href, title, description, Icon }, i) => (
                <Link
                  key={href}
                  href={href}
                  className="group home-nav-row opacity-0 home-slide-up"
                  style={{ animationDelay: `${0.35 + i * 0.08}s` }}
                >
                  <span className="home-nav-icon-well" aria-hidden>
                    <Icon className={iconClass} strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block font-semibold text-[var(--title-blue)]">
                      {title}
                    </span>
                    <span className="mt-0.5 block text-pretty text-sm leading-snug text-gray-600">
                      {description}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-5 shrink-0 text-gray-400 transition-[transform,color] group-hover:translate-x-0.5 group-hover:text-[var(--accent-orange)]"
                    aria-hidden
                  />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}
