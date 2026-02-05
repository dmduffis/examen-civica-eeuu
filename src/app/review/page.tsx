"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { BeatLoader } from "react-spinners";
import {
  getStoredStateCode,
  setStoredStateCode,
  fetchStates,
  fetchStateDetails,
  type StateOption,
  type StateDetails,
} from "../lib/state-api";

type Answer = { _id: string; isCorrect: boolean; answerText: string };
type QuestionItem = {
  _id: string;
  questionText: string;
  answers: Answer[];
  isStateSpecific?: boolean;
};

const ReviewIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 shrink-0 text-gray-700"
  >
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
  </svg>
);

export default function ReviewPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<StateOption[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState<string | null>(null);
  const [stateDetails, setStateDetails] = useState<StateDetails | null>(null);

  useEffect(() => {
    setSelectedStateCode(getStoredStateCode());
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const endpoint =
          "https://examencivicabackend-production.up.railway.app/api/question/";
        const response = await axios.get(endpoint, {
          headers: { "Content-Type": "application/json" },
        });
        setQuestions(response.data);
        const statesList = await fetchStates().catch(() => []);
        setStates(statesList);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las preguntas.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedStateCode) {
      setStateDetails(null);
      return;
    }
    let cancelled = false;
    fetchStateDetails(selectedStateCode)
      .then((details) => {
        if (!cancelled) setStateDetails(details);
      })
      .catch(() => {
        if (!cancelled) setStateDetails(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedStateCode]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] w-full flex-col items-center justify-center">
        <BeatLoader color="rgba(214, 169, 54, 0.6)" speedMultiplier={0.5} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col w-full justify-center mt-8">
        <p className="text-center text-red-600">{error}</p>
        <div className="flex justify-center mt-4">
          <Link href="/" className="text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const handleStateChange = (stateCode: string | null) => {
    setSelectedStateCode(stateCode);
    setStoredStateCode(stateCode);
  };

  return (
    <main className="flex flex-col w-full justify-center mt-8 pb-16">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <ReviewIcon />
            Lista de preguntas
          </h1>
          <p className="text-gray-500 text-sm mt-3 max-w-md">
            Hay 100 preguntas en total; en la entrevista te harán 20 de forma
            oral. Aquí puedes estudiarlas todas con sus respuestas correctas.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-gray-900 hover:underline shrink-0"
        >
          ← Inicio
        </Link>
      </div>

      <div className="w-full max-w-sm mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tu estado (para las 4 preguntas específicas de tu estado)
        </label>
        <select
          value={selectedStateCode ?? ""}
          onChange={(e) => handleStateChange(e.target.value || null)}
          className="w-full rounded-lg border-2 border-slate-300 bg-white py-2.5 px-3 text-gray-800"
        >
          <option value="">— Seleccionar estado —</option>
          {states.map((s) => (
            <option key={s.stateCode} value={s.stateCode}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-8">
        {questions.map((q, index) => (
          <article
            key={q._id}
            className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm"
          >
            <p className="font-semibold text-gray-800 mb-3">
              {index + 1}. {q.questionText}
            </p>
            {q.isStateSpecific && (
              <div className="mb-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800 font-medium mb-1">
                  Pregunta de tu estado — busca la respuesta según donde vives.
                </p>
                {stateDetails ? (
                  <ul className="text-sm text-gray-700 space-y-0.5">
                    {stateDetails.senators.length > 0 ? (
                      <li>
                        Senadores: {stateDetails.senators.join(", ")}
                      </li>
                    ) : (
                      <li>
                        {stateDetails.stateCode === "DC"
                          ? "D.C. no tiene senadores."
                          : "—"}
                      </li>
                    )}
                    {stateDetails.governor != null ? (
                      <li>Gobernador(a): {stateDetails.governor}</li>
                    ) : (
                      <li>
                        {stateDetails.stateCode === "DC"
                          ? "D.C. no tiene gobernador."
                          : "—"}
                      </li>
                    )}
                    {stateDetails.capital != null ? (
                      <li>Capital: {stateDetails.capital}</li>
                    ) : (
                      <li>
                        {stateDetails.stateCode === "DC"
                          ? "D.C. no es un estado; no aplica capital."
                          : "—"}
                      </li>
                    )}
                    <li>Representante: busca por distrito.</li>
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">
                    Elige tu estado arriba para ver las respuestas de tu estado
                    aquí.
                  </p>
                )}
              </div>
            )}
            <ul className="space-y-2">
              {q.answers
                .filter((answer) => answer.isCorrect)
                .map((answer) => (
                  <li
                    key={answer._id}
                    className="pl-3 py-1 rounded text-gray-800"
                  >
                    {answer.answerText}
                  </li>
                ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Link
          href="/quiz"
          className="rounded-lg text-gray-900 py-2 px-4 bg-slate-200 border border-slate-300 hover:bg-yellow-500"
        >
          Tomar el Quiz
        </Link>
      </div>
    </main>
  );
}
