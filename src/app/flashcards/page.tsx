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

const API_ENDPOINT =
  "https://examencivicabackend-production.up.railway.app/api/question/";

const CheckAllIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 shrink-0"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const ClearAllIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 shrink-0"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3.5 h-3.5 text-amber-600"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const FlashcardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-2 -2 28 28"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 shrink-0 text-gray-700"
  >
    <rect
      x="2"
      y="4"
      width="14"
      height="18"
      rx="1.5"
      transform="rotate(-8 9 13)"
    />
    <rect
      x="8"
      y="0"
      width="14"
      height="18"
      rx="1.5"
      transform="rotate(8 15 9)"
    />
  </svg>
);

export default function FlashcardsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<StateOption[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState<string | null>(
    null,
  );
  const [stateDetails, setStateDetails] = useState<StateDetails | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"select" | "study">("select");
  const [studyQueue, setStudyQueue] = useState<QuestionItem[]>([]);
  const [marks, setMarks] = useState<Record<string, "right" | "wrong">>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setSelectedStateCode(getStoredStateCode());
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

  useEffect(() => {
    const load = async () => {
      try {
        const [response, statesList] = await Promise.all([
          axios.get(API_ENDPOINT, {
            headers: { "Content-Type": "application/json" },
          }),
          fetchStates().catch(() => []),
        ]);
        setQuestions(response.data);
        setSelectedIds(new Set(response.data.map((q: QuestionItem) => q._id)));
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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(questions.map((q) => q._id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const selectedQuestions = questions.filter((q) => selectedIds.has(q._id));

  const startStudy = () => {
    setMarks({});
    setStudyQueue(selectedQuestions);
    setCurrentIndex(0);
    setFlipped(false);
    setView("study");
  };

  const markCurrent = (right: boolean) => {
    if (!currentQuestion) return;
    setMarks((prev) => ({
      ...prev,
      [currentQuestion._id]: right ? "right" : "wrong",
    }));
    // Advance to next card (or first if at end)
    setCurrentIndex((i) => (i >= studyQueue.length - 1 ? 0 : i + 1));
    setFlipped(false);
  };

  const wrongCount = selectedQuestions.filter(
    (q) => marks[q._id] === "wrong",
  ).length;
  const showWrongOnly =
    studyQueue.length > 0 && studyQueue.length < selectedQuestions.length;

  const currentQuestion = studyQueue[currentIndex];
  const correctAnswers =
    currentQuestion?.answers.filter((a) => a.isCorrect) ?? [];
  const currentMark = currentQuestion ? marks[currentQuestion._id] : undefined;

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
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  if (view === "study") {
    if (selectedQuestions.length === 0) {
      return (
        <main className="flex flex-col w-full justify-center mt-8">
          <p className="text-center text-gray-600">
            No hay preguntas seleccionadas.
          </p>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setView("select")}
              className="text-gray-600 hover:text-gray-900 hover:underline"
            >
              Elegir preguntas
            </button>
          </div>
        </main>
      );
    }

    const startWrongOnly = () => {
      const wrongOnly = selectedQuestions.filter(
        (q) => marks[q._id] === "wrong",
      );
      if (wrongOnly.length === 0) return;
      setStudyQueue(wrongOnly);
      setCurrentIndex(0);
      setFlipped(false);
    };

    const backToAll = () => {
      setStudyQueue(selectedQuestions);
      setCurrentIndex(0);
      setFlipped(false);
    };

    return (
      <main className="flex flex-col w-full justify-center mt-8 pb-16">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-10 sm:gap-4 w-full mb-8 sm:mb-6">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-800 hover:underline shrink-0 order-1 sm:order-2"
          >
            ← Inicio
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 order-2 sm:order-1">
            <FlashcardIcon />
            Revisar
          </h1>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {studyQueue.length}
            {showWrongOnly && " (solo incorrectas)"}
          </span>
          <button
            onClick={() => setView("select")}
            className="text-sm text-gray-500 hover:text-gray-800 hover:underline"
          >
            Cambiar preguntas
          </button>
        </div>

        <div
          className="min-h-[200px] rounded-xl border-2 border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center p-6 cursor-pointer select-none touch-manipulation"
          onClick={() => setFlipped((f) => !f)}
        >
          {!flipped ? (
            <p className="text-lg font-semibold text-gray-800 text-center">
              {currentQuestion.questionText}
            </p>
          ) : (
            <div className="text-center w-full">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Respuesta
              </p>
              {currentQuestion.isStateSpecific ? (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-left inline-block">
                  {stateDetails ? (
                    <ul className="text-sm text-gray-700 space-y-0.5">
                      {stateDetails.senators.length > 0 ? (
                        <li>Senadores: {stateDetails.senators.join(", ")}</li>
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
                    <p className="text-sm text-amber-800">
                      Elige tu estado en la pantalla de selección para ver las
                      respuestas de tu estado aquí.
                    </p>
                  )}
                </div>
              ) : (
                <ul className="space-y-1.5 text-left inline-block">
                  {correctAnswers.map((a) => (
                    <li key={a._id} className="text-base text-gray-800">
                      {a.answerText}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">
            Toca la tarjeta para voltear
          </p>
        </div>

        {flipped && (
          <div className="flex gap-3 justify-center mt-5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                markCurrent(true);
              }}
              className="rounded-xl py-2.5 px-5 bg-green-50 border-2 border-green-300 text-green-800 font-medium hover:bg-green-100 transition-colors"
            >
              Correcto
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                markCurrent(false);
              }}
              className="rounded-xl py-2.5 px-5 bg-red-50 border-2 border-red-300 text-red-800 font-medium hover:bg-red-100 transition-colors"
            >
              Incorrecto
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mt-8 gap-4">
          <button
            onClick={() => {
              setCurrentIndex((i) => Math.max(0, i - 1));
              setFlipped(false);
            }}
            disabled={currentIndex === 0}
            className="rounded-xl py-2.5 px-5 bg-white border-2 border-slate-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 hover:border-amber-200 transition-colors font-medium text-gray-800"
          >
            Anterior
          </button>
          <button
            onClick={() => {
              setCurrentIndex((i) => (i >= studyQueue.length - 1 ? 0 : i + 1));
              setFlipped(false);
            }}
            className="rounded-xl py-2.5 px-5 bg-white border-2 border-slate-200 shadow-sm hover:bg-amber-50 hover:border-amber-200 transition-colors font-medium text-gray-800"
          >
            {currentIndex >= studyQueue.length - 1 ? "Primera" : "Siguiente"}
          </button>
        </div>

        <div className="flex justify-center mt-6 pt-4 border-t border-slate-200">
          {wrongCount > 0 && !showWrongOnly && (
            <button
              onClick={startWrongOnly}
              className="rounded-xl py-2 px-4 text-sm bg-amber-50 border-2 border-amber-200 text-amber-900 font-medium hover:bg-amber-100 transition-colors"
            >
              Repasar solo incorrectas ({wrongCount})
            </button>
          )}
          {showWrongOnly && (
            <button
              onClick={backToAll}
              className="rounded-xl py-2 px-4 text-sm bg-white border-2 border-slate-200 text-gray-700 font-medium hover:bg-amber-50 hover:border-amber-200 transition-colors"
            >
              Volver a todas
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full justify-center mt-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-10 sm:gap-4 w-full mb-4">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-800 hover:underline shrink-0 order-1 sm:order-2"
        >
          ← Inicio
        </Link>
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2 order-2 sm:order-1">
          <FlashcardIcon />
          Revisar
        </h1>
      </div>
      <p className="text-gray-500 text-sm mt-1 mb-6">
        Elige las preguntas que quieres repasar y estudia con tarjetas.
      </p>

      <section className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tu estado (para las 4 preguntas de tu estado)
        </label>
        <select
          value={selectedStateCode ?? ""}
          onChange={(e) => {
            const code = e.target.value || null;
            setSelectedStateCode(code);
            setStoredStateCode(code);
          }}
          className="w-full max-w-xs rounded-xl border-2 border-slate-200 bg-white py-2.5 px-3 text-gray-800 shadow-sm"
        >
          <option value="">— Seleccionar estado —</option>
          {states.map((s) => (
            <option key={s.stateCode} value={s.stateCode}>
              {s.name}
            </option>
          ))}
        </select>
      </section>

      <div className="flex gap-2 mb-3">
        <button
          onClick={selectAll}
          className="rounded-xl py-2 px-3 text-sm bg-white border-2 border-slate-200 shadow-sm hover:bg-amber-50 hover:border-amber-200 inline-flex items-center gap-1.5 transition-colors font-medium text-gray-700"
        >
          <CheckAllIcon />
          Todas
        </button>
        <button
          onClick={deselectAll}
          className="rounded-xl py-2 px-3 text-sm bg-white border-2 border-slate-200 shadow-sm hover:bg-amber-50 hover:border-amber-200 inline-flex items-center gap-1.5 transition-colors font-medium text-gray-700"
        >
          <ClearAllIcon />
          Quitar todas
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-2">
        {selectedIds.size} de {questions.length} seleccionadas
      </p>
      <div className="flex flex-col gap-2 max-h-[45vh] overflow-y-auto mb-6 pr-1">
        {questions.map((q, index) => (
          <label
            key={q._id}
            className="flex items-center gap-3 min-h-[52px] w-full min-w-0 py-3 px-3 pb-6 border-2 border-slate-200 rounded-xl bg-white cursor-pointer hover:bg-amber-50/50 hover:border-amber-200 transition-colors"
          >
            <span className="relative shrink-0 flex items-center justify-center w-[22px] h-[22px]">
              <input
                type="checkbox"
                checked={selectedIds.has(q._id)}
                onChange={() => toggleSelect(q._id)}
                className="sr-only peer"
              />
              <span
                className={`inline-flex items-center justify-center w-[22px] h-[22px] rounded-md border-2 bg-white ${
                  selectedIds.has(q._id)
                    ? "border-amber-400 bg-amber-50"
                    : "border-slate-300"
                }`}
                aria-hidden
              >
                {selectedIds.has(q._id) && <CheckIcon />}
              </span>
            </span>
            <span className="text-gray-800 text-sm text-left min-w-0 flex-1 py-0.5 break-words">
              {index + 1}. {q.questionText}
            </span>
          </label>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-200">
        <button
          onClick={startStudy}
          disabled={selectedIds.size === 0}
          className="w-full rounded-xl py-3.5 px-6 bg-slate-200 border-2 border-slate-300 hover:bg-amber-100 hover:border-amber-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Revisar {selectedIds.size} tarjeta{selectedIds.size !== 1 ? "s" : ""}
        </button>
      </div>
    </main>
  );
}
