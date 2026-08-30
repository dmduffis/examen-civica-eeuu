import type { Metadata } from "next";
import Link from "next/link";
import ErrorIllustration from "./components/ErrorIllustration";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex w-full flex-col items-center justify-center px-6 pb-16 page-top">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <ErrorIllustration priority />
        <h1 className="page-heading mb-3 mt-8 text-ink">
          ¡Ups! Algo salió mal.
        </h1>
        <p className="mb-8 max-w-sm font-medium text-[#b4534a]">
          Esa ruta no existe. Vuelve al inicio para seguir practicando el examen
          cívico.
        </p>
        <Link href="/" className="btn-brand py-2.5 px-6">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
