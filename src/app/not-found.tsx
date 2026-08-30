import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex w-full flex-col items-center justify-center px-6 pb-16 pt-6 mt-2 sm:mt-8 sm:pt-12">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <Image
          src="/404-illustration.png"
          alt="Ilustración de error 404: un gato triste frente al número 404, con la Estatua de la Libertad y la bandera de Estados Unidos."
          width={1024}
          height={745}
          className="h-auto w-full max-w-md"
          priority
        />
        <h1 className="page-heading mb-3 mt-8">Página no encontrada</h1>
        <p className="mb-8 max-w-sm text-brand-muted">
          Esa ruta no existe. Vuelve al inicio para seguir practicando el examen
          cívico.
        </p>
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
