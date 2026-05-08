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
    <main className="flex w-full flex-col items-center justify-center px-6 pb-16 pt-6 mt-2 sm:mt-8 sm:pt-12">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        {illustration}
        <h1 className="page-heading mb-3 mt-8">{title}</h1>
        <p className="mb-8 max-w-sm text-gray-600">{message}</p>
        <Link
          href="/"
          className="inline-flex rounded-xl border-2 border-slate-300 bg-slate-200 px-6 py-4 font-semibold text-gray-800 transition-colors hover:border-orange-200 hover:bg-orange-100"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
