import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz",
  description:
    "Practica el examen de educación cívica con un quiz al azar. Elige 10, 20 o 50 preguntas o todas. Prepárate para la entrevista de naturalización.",
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 justify-center max-w-[1067px]">{children}</div>
  );
}
