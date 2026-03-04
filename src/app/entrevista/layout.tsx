import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrevista de Práctica",
  description:
    "Practica la entrevista de naturalización en inglés con audio. Escucha las preguntas y responde en voz alta con el micrófono, como en la entrevista real.",
};

export default function EntrevistaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
