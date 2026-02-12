"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import { fetchQuizHistory } from "../lib/profile-api";
import type { QuizHistoryEntry } from "../lib/auth-types";
import { BeatLoader } from "react-spinners";
import { ScoreChart } from "../components/ScoreChart";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProgressPage() {
  const { user, loading: authLoading, isAuthEnabled } = useAuth();
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthEnabled || !user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchQuizHistory()
      .then((data) => {
        if (!cancelled) setHistory(data);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el historial.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [isAuthEnabled, user]);

  if (!isAuthEnabled) {
    return (
      <main className="flex flex-col w-full justify-center pt-16 mt-8 pb-16">
        <div className="w-full px-6 sm:px-8 text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Mi progreso</h1>
          <p className="text-gray-600 mb-6">
            La sincronización entre dispositivos no está disponible. Tu historial se guarda solo en este dispositivo.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-xl bg-amber-500 text-white font-semibold px-4 py-2 hover:bg-amber-600 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  if (authLoading) {
    return (
      <main className="flex flex-col w-full justify-center pt-16 mt-8 pb-16">
        <div className="flex min-h-[40vh] items-center justify-center">
          <BeatLoader color="rgba(214, 169, 54, 0.6)" speedMultiplier={0.5} />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex flex-col w-full justify-center pt-16 mt-8 pb-16">
        <div className="w-full px-6 sm:px-8 text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Mi progreso</h1>
          <p className="text-gray-600 mb-6">
            Inicia sesión para ver tu historial de quizzes.
          </p>
          <Link
            href="/login"
            className="inline-flex rounded-xl bg-amber-500 text-white font-semibold px-4 py-2 hover:bg-amber-600 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col w-full justify-center pt-16 mt-8 pb-16">
        <div className="w-full px-6 sm:px-8">
          <p className="text-center text-red-600">{error}</p>
          <div className="flex justify-center mt-4">
            <Link href="/" className="text-amber-700 hover:underline">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full justify-center pt-16 mt-8 pb-16">
      <div className="w-full px-6 sm:px-8">
        <h1 className="text-2xl sm:text-[2.5rem] font-bold text-gray-800 mb-2">
          Mi progreso
        </h1>
        <p className="text-gray-600 mb-8">
          Historial de tus quizzes. Inicia sesión en otro dispositivo para ver el mismo historial.
        </p>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <BeatLoader color="rgba(214, 169, 54, 0.6)" speedMultiplier={0.5} />
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-gray-600 mb-4">Aún no hay quizzes guardados.</p>
            <Link
              href="/quiz"
              className="inline-flex rounded-xl bg-amber-500 text-white font-semibold px-4 py-2 hover:bg-amber-600 transition-colors"
            >
              Tomar Quiz
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 max-w-lg">
              <ScoreChart entries={history} width={400} height={220} />
            </div>
            <ul className="flex flex-col gap-3">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {entry.scorePercent}% — {entry.correct} de {entry.total} correctas
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDate(entry.date)}
                  </p>
                </div>
                <div className="flex h-8 w-24 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${entry.scorePercent}%` }}
                  />
                </div>
              </li>
            ))}
            </ul>
          </>
        )}

        <div className="mt-8">
          <Link
            href="/quiz"
            className="inline-flex rounded-xl bg-amber-500 text-white font-semibold px-4 py-2 hover:bg-amber-600 transition-colors"
          >
            Tomar otro Quiz
          </Link>
        </div>
      </div>
    </main>
  );
}
