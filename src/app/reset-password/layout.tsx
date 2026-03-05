import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  description: "Introduce tu nueva contraseña para completar el restablecimiento.",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
