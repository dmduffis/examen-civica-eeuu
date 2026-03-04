import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Repasar",
  description:
    "Repasa las 100 preguntas del examen cívico con tarjetas. Elige las preguntas que quieres estudiar y practica con flashcards para la entrevista de naturalización.",
};

export default function RepasarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
