import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Prepárate para tu examen de ciudadanía. Estudia las preguntas oficiales, practica simulacros y la entrevista oral de naturalización en Estados Unidos.",
};

const steps = [
  {
    number: "01",
    title: "Aprende",
    description:
      "Estudia las preguntas y respuestas del examen de educación cívica.",
  },
  {
    number: "02",
    title: "Practica",
    description:
      "Haz simulacros y enfócate en las preguntas que necesitas reforzar.",
  },
  {
    number: "03",
    title: "Llega preparado",
    description:
      "Practica la entrevista oral y responde como lo harás el día del examen.",
  },
] as const;

const actionCards: {
  href: string;
  title: string;
  description: string;
  iconSrc: string;
}[] = [
  {
    href: "/preguntas",
    title: "Preguntas",
    description: "Estudia las preguntas oficiales.",
    iconSrc: "/icon_quiz_questions.png",
  },
  {
    href: "/repasar",
    title: "Repasar",
    description: "Refuerza lo que te cuesta.",
    iconSrc: "/icon_quiz_review.png",
  },
  {
    href: "/quiz",
    title: "Tomar Quiz",
    description: "Pon a prueba lo que sabes.",
    iconSrc: "/icon_quiz_practice.png",
  },
  {
    href: "/entrevista",
    title: "Entrevista",
    description: "Practica la entrevista oral.",
    iconSrc: "/icon_quiz_interview.png",
  },
];

const stats = [
  {
    value: "128",
    description: "preguntas oficiales en el examen de educación cívica 2025",
  },
  {
    value: "20",
    description: "preguntas como máximo durante la entrevista",
  },
  {
    value: "12",
    description: "respuestas correctas para aprobar",
  },
] as const;

const customIconClass = "size-[4.25rem] sm:size-[5.25rem] lg:size-24";

export default function Home() {
  return (
    <main className="flex flex-col w-full items-center justify-center page-top pb-16 lg:items-stretch">
      <div className="w-full min-w-0 px-6 sm:px-8 max-w-6xl lg:max-w-none mx-auto lg:mx-0">
        {/* 1. Hero header */}
        <header className="page-title-in mb-4 sm:mb-5 lg:mb-6 text-left max-w-3xl">
          <h1 className="page-heading mb-1.5">
            Prepárate para tu examen de ciudadanía
          </h1>
          <p className="text-base sm:text-lg text-brand-muted leading-relaxed max-w-2xl">
            Llega con confianza a tu entrevista de naturalización en Estados
            Unidos.
          </p>
        </header>

        {/* 2. Three steps + illustration */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)] gap-10 lg:gap-[5rem] items-center w-full min-w-0">
          <section
            aria-label="Pasos para prepararte"
            className="order-1 w-full min-w-0 page-content-in opacity-0"
            style={{ animationDelay: "0.1s" }}
          >
            <ol className="list-none m-0 p-0">
              {steps.map(({ number, title, description }, i) => (
                <li
                  key={number}
                  className="home-step opacity-0 home-slide-up"
                  style={{ animationDelay: `${0.2 + i * 0.08}s` }}
                >
                  <span className="home-step-number" aria-hidden>
                    {number}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="font-semibold text-ink">{title}</p>
                    <p className="mt-1 text-sm sm:text-base text-brand-muted leading-snug text-pretty">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div
            className="order-2 flex w-full justify-center lg:justify-end items-center min-w-0 home-fade-in"
            style={{ animationDelay: "0.05s" }}
          >
            <Image
              src="/landing_illustration.png"
              width={1254}
              height={1254}
              alt="Person studying for the US civics exam with a White House model on the desk"
              className="w-[min(100%,320px)] lg:w-[min(100%,441px)] h-auto"
              priority
            />
          </div>
        </div>

        {/* 3. Four action cards — full-bleed band */}
        <section
          aria-labelledby="home-actions-heading"
          className="home-actions-band"
        >
          <div className="home-actions-band-inner">
            <header
              className="home-actions-band-header page-content-in opacity-0"
              style={{ animationDelay: "0.35s" }}
            >
              <h2 id="home-actions-heading">
                Todo lo que necesitas para llegar preparado
              </h2>
              <p>
                Practica a tu ritmo, refuerza lo que te cuesta y gana confianza
                antes de tu entrevista.
              </p>
            </header>
            <nav
              aria-label="Principales secciones"
              className="home-actions-band-grid"
            >
              {actionCards.map(({ href, title, description, iconSrc }, i) => (
                <Link
                  key={href}
                  href={href}
                  className="home-action-card opacity-0 home-slide-up"
                  style={{ animationDelay: `${0.45 + i * 0.08}s` }}
                >
                  <span className="home-nav-icon-well" aria-hidden>
                    <Image
                      src={iconSrc}
                      width={1254}
                      height={1254}
                      alt=""
                      className={`${customIconClass} object-contain`}
                    />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="home-action-title block font-semibold">
                      {title}
                    </span>
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="home-action-desc min-w-0 flex-1 text-sm font-normal leading-snug">
                        {description}
                      </span>
                      <span className="home-action-arrow" aria-hidden>
                        <ChevronRight className="size-4" strokeWidth={2.5} />
                      </span>
                    </span>
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </section>

        {/* 4. Statistics */}
        <section
          aria-labelledby="home-stats-heading"
          className="mt-16 sm:mt-20 pt-12 sm:pt-14 page-content-in opacity-0"
          style={{ animationDelay: "0.75s" }}
        >
          <h2
            id="home-stats-heading"
            className="text-lg sm:text-xl font-bold text-ink mb-10 sm:mb-12"
          >
            El examen en números
          </h2>
          <div className="home-stats-grid">
            {stats.map(({ value, description }) => (
              <div key={value} className="home-stat">
                <p className="home-stat-value">{value}</p>
                <p className="mt-3 text-sm sm:text-base text-brand-muted leading-snug max-w-xs">
                  {description}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-10 sm:mt-12 text-xs text-brand-muted/80">
            Fuente: USCIS
          </p>
        </section>
      </div>
    </main>
  );
}
