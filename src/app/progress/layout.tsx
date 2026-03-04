import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi progreso",
  description:
    "Historial de tus quizzes y progreso. Inicia sesión para sincronizar tu historial entre dispositivos.",
};

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
