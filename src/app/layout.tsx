import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

import { Spline_Sans } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import Nav from "./components/Nav";
import { AuthProvider } from "./lib/auth-context";

const splineSans = Spline_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const geistSans = GeistSans;

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
      <body className={`${splineSans.variable} ${geistSans.variable} ${geistSans.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <Nav />
          <div className="flex flex-1 justify-center w-full">
            <div className="max-w-[1067px] w-full mx-auto">{children}</div>
          </div>
          <footer className="mt-10 py-4 px-6 sm:px-8 text-sm text-gray-500 bg-slate-100/80 border-t border-slate-200">
            <div className="max-w-[1067px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span>© {new Date().getFullYear()} Examen Cívica</span>
              <a
                href="https://www.uscis.gov/citizenship/find-study-materials-and-resources/study-for-the-test"
                target="_blank"
                rel="noopener noreferrer"
                className="sm:text-right hover:text-gray-700 transition-colors"
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
