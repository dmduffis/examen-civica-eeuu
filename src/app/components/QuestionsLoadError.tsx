import Link from "next/link";
import BrokenLinkIllustration from "./BrokenLinkIllustration";
import RepasarLoadErrorIllustration from "./RepasarLoadErrorIllustration";

type Props = {
  message?: string;
  /** Repasar (tarjetas) usa ilustración distinta a la lista de preguntas. */
  variant?: "preguntas" | "repasar";
};

export default function QuestionsLoadError({
  message = "No se pudieron cargar las preguntas. Comprueba tu conexión e inténtalo más tarde.",
  variant = "preguntas",
}: Props) {
  const illustration =
    variant === "repasar" ? (
      <RepasarLoadErrorIllustration priority />
    ) : (
      <BrokenLinkIllustration priority />
    );
  const title =
    variant === "repasar"
      ? "No se pudo cargar el repaso"
      : "No se pudo cargar el contenido";

  return (
    <main className="flex w-full flex-col items-center justify-center px-6 pb-16 page-top">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        {illustration}
        <h1 className="page-heading mb-3 mt-8">{title}</h1>
        <p className="mb-8 max-w-sm text-brand-muted">{message}</p>
        <Link
          href="/"
          className="btn-tile px-6 py-4 font-semibold text-ink"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
