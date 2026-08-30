"use client";

import Link from "next/link";
import ErrorIllustration from "./ErrorIllustration";

type Props = {
  message?: string;
  /** Kept for call sites; illustration is shared for all variants. */
  variant?: "preguntas" | "repasar";
  /** Primary action — defaults to full page reload */
  onRetry?: () => void;
  showHomeLink?: boolean;
};

const softErrorText = "text-[#b4534a]";

export default function QuestionsLoadError({
  message = "No se pudieron cargar las preguntas. Comprueba tu conexión e inténtalo más tarde.",
  variant: _variant = "preguntas",
  onRetry,
  showHomeLink = true,
}: Props) {
  const handleRetry =
    onRetry ??
    (() => {
      window.location.reload();
    });

  return (
    <main className="flex w-full flex-col items-center justify-center px-6 pb-16 page-top">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <ErrorIllustration priority />
        <h1 className="page-heading mb-3 mt-8 text-ink">
          ¡Ups! Algo salió mal.
        </h1>
        <p className={`mb-8 max-w-sm font-medium ${softErrorText}`}>
          {message}
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleRetry}
            className="btn-brand py-2.5 px-6"
          >
            Reintentar
          </button>
          {showHomeLink ? (
            <Link
              href="/"
              className="btn-tile px-6 py-2.5 font-semibold text-ink"
            >
              Volver al inicio
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
