import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description: "Recibe un enlace por correo para restablecer tu contraseña.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
