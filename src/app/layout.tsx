import type { Metadata } from "next";
import "./globals.css";

import { Manrope } from 'next/font/google'

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Examen de Educación Cívica",
  description: "examen de educación cívica para naturalización",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} flex justify-center mx-8`}>{children}</body>
    </html>
  );
}
