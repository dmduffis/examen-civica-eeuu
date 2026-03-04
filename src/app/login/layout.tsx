import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cuenta",
  description:
    "Inicia sesión o crea una cuenta para guardar tu historial de quizzes y sincronizarlo entre dispositivos.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
