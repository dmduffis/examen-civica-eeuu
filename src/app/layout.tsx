import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

import { Rubik, Space_Grotesk } from "next/font/google";
import Nav from "./components/Nav";
import { AuthProvider } from "./lib/auth-context";

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://examencivica.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Examen de Educación Cívica | Práctica para la naturalización USA",
    template: "%s | Examen Cívica",
  },
  description:
    "Practica las 100 preguntas del examen de educación cívica para la entrevista de naturalización de Estados Unidos. Quiz, lista de preguntas, repaso con tarjetas y entrevista en audio.",
  keywords: [
    "examen cívica USA",
    "naturalización",
    "ciudadanía americana",
    "100 preguntas civics",
    "entrevista naturalización",
    "USCIS",
    "práctica examen cívica",
  ],
  authors: [{ name: "Examen Cívica" }],
  creator: "Examen Cívica",
  openGraph: {
    type: "website",
    locale: "es",
    siteName: "Examen de Educación Cívica",
    title: "Examen de Educación Cívica | Práctica para la naturalización USA",
    description:
      "Practica las 100 preguntas del examen de educación cívica para la entrevista de naturalización. Quiz, lista de preguntas, repaso y entrevista en audio.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Examen de Educación Cívica | Práctica para la naturalización USA",
    description:
      "Practica las 100 preguntas del examen de educación cívica para la entrevista de naturalización.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`page-shell ${rubik.variable} ${spaceGrotesk.variable} ${rubik.className}`}
      >
        <AuthProvider>
          <Nav />
          <div className="flex flex-1 justify-center w-full">
            <div className="max-w-[1067px] w-full mx-auto">{children}</div>
          </div>
          <footer className="site-footer">
            <div className="max-w-[1067px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span>© {new Date().getFullYear()} Examen Cívica</span>
              <a
                href="https://www.uscis.gov/citizenship/find-study-materials-and-resources/study-for-the-test"
                target="_blank"
                rel="noopener noreferrer"
                className="sm:text-right transition-colors"
              >
                For more information, visit the official U.S. government site
              </a>
            </div>
          </footer>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
