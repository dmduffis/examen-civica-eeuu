import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lista de Preguntas",
  description:
    "Las 100 preguntas del examen de educación cívica con respuestas correctas. Estudia en español o inglés. Incluye las 4 preguntas específicas de tu estado.",
};

export default function PreguntasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
