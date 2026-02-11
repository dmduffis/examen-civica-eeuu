import type { Metadata } from "next";
import "./globals.css";

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
        </AuthProvider>
      </body>
    </html>
  );
}
