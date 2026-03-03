"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { CheckCheck, X, Check } from "lucide-react";
import { BeatLoader } from "react-spinners";
import {
  getStoredStateCode,
  setStoredStateCode,
  fetchStates,
  fetchStateDetails,
  type StateOption,
  type StateDetails,
} from "../lib/state-api";
import { useAuth } from "../lib/auth-context";
import { fetchProfile, updateProfileState } from "../lib/profile-api";
import type { QuestionItem } from "../lib/question-types";
import { questionDisplayText, answerDisplayText } from "../lib/question-types";
import type { DisplayLang } from "../lib/question-types";
import { backendUrl } from "../lib/backend-url";

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
  const [displayLang, setDisplayLang] = useState<DisplayLang>("es");
  const { user, isAuthEnabled } = useAuth();

  useEffect(() => {
    setSelectedStateCode(getStoredStateCode());
  }, []);

  useEffect(() => {
    if (!isAuthEnabled || !user) return;
    let cancelled = false;
    fetchProfile()
      .then((profile) => {
        if (!cancelled && profile?.stateCode != null) {
          setSelectedStateCode(profile.stateCode);
          setStoredStateCode(profile.stateCode);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthEnabled, user]);

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
          axios.get(backendUrl("/api/question"), {
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
      <main className="flex flex-col w-full justify-center mt-2 sm:mt-8">
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
        <main className="flex flex-col w-full justify-center mt-2 sm:mt-8">
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
      <main className="flex flex-col w-full justify-center pt-6 mt-2 sm:pt-16 sm:mt-8 pb-16">
        <div className="w-full px-6 sm:px-8">
          <div className="text-left mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-[2.5rem] font-bold text-[var(--title-blue)] mb-3 leading-tight">
              Repasar
            </h1>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {studyQueue.length}
              {showWrongOnly && " (solo incorrectas)"}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <button
                type="button"
                onClick={() => setDisplayLang("es")}
                className={`px-2 py-1 rounded ${displayLang === "es" ? "bg-amber-100 text-amber-800 font-medium" : "hover:bg-slate-100"}`}
              >
                ES
              </button>
              <span aria-hidden>|</span>
              <button
                type="button"
                onClick={() => setDisplayLang("en")}
                className={`px-2 py-1 rounded ${displayLang === "en" ? "bg-amber-100 text-amber-800 font-medium" : "hover:bg-slate-100"}`}
              >
                EN
              </button>
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
                {questionDisplayText(currentQuestion, displayLang)}
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
                    {correctAnswers.map((a, aIdx) => (
                      <li
                        key={a._id ?? `a-${aIdx}`}
                        className="text-base text-gray-800"
                      >
                        {answerDisplayText(a, displayLang)}
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
              className="rounded-xl py-2.5 px-5 bg-white border-2 border-slate-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 hover:border-orange-200 transition-colors font-medium text-gray-800"
            >
              Anterior
            </button>
            <button
              onClick={() => {
                setCurrentIndex((i) =>
                  i >= studyQueue.length - 1 ? 0 : i + 1,
                );
                setFlipped(false);
              }}
              className="rounded-xl py-2.5 px-5 bg-white border-2 border-slate-200 shadow-sm hover:bg-orange-50 hover:border-orange-200 transition-colors font-medium text-gray-800"
            >
              {currentIndex >= studyQueue.length - 1 ? "Primera" : "Siguiente"}
            </button>
          </div>

          <div className="flex justify-center mt-6 pt-4 border-t border-slate-200">
            {wrongCount > 0 && !showWrongOnly && (
              <button
                onClick={startWrongOnly}
                className="rounded-xl py-2 px-4 text-sm bg-amber-50 border-2 border-amber-200 text-amber-900 font-medium hover:bg-orange-100 transition-colors"
              >
                Repasar solo incorrectas ({wrongCount})
              </button>
            )}
            {showWrongOnly && (
              <button
                onClick={backToAll}
                className="rounded-xl py-2 px-4 text-sm bg-white border-2 border-slate-200 text-gray-700 font-medium hover:bg-orange-50 hover:border-orange-200 transition-colors"
              >
                Volver a todas
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full justify-center pt-6 mt-2 sm:pt-16 sm:mt-8 pb-16">
      <div className="w-full px-6 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 sm:mb-10">
          <div className="text-left min-w-0">
            <h1 className="text-2xl sm:text-[2.5rem] font-bold text-[var(--title-blue)] mb-3 leading-tight">
              Repasar
            </h1>
            <p className="text-gray-600">
              Elige las preguntas que quieres repasar y estudia con tarjetas.
            </p>
          </div>
          <span className="flex items-center gap-1 text-sm text-gray-500 shrink-0 sm:pt-1">
            <button
              type="button"
              onClick={() => setDisplayLang("es")}
              className={`px-2 py-1 rounded ${displayLang === "es" ? "bg-amber-100 text-amber-800 font-medium" : "hover:bg-slate-100"}`}
            >
              ES
            </button>
            <span aria-hidden>|</span>
            <button
              type="button"
              onClick={() => setDisplayLang("en")}
              className={`px-2 py-1 rounded ${displayLang === "en" ? "bg-amber-100 text-amber-800 font-medium" : "hover:bg-slate-100"}`}
            >
              EN
            </button>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div className="flex gap-2 shrink-0 order-2 sm:order-1">
            <button
              onClick={selectAll}
              className="h-11 rounded-xl px-3 text-sm bg-white border-2 border-slate-200 shadow-sm hover:bg-orange-50 hover:border-orange-200 inline-flex items-center gap-1.5 transition-colors font-medium text-gray-700"
            >
              <CheckCheck size={16} className="shrink-0" aria-hidden />
              Todas
            </button>
            <button
              onClick={deselectAll}
              className="h-11 rounded-xl px-3 text-sm bg-white border-2 border-slate-200 shadow-sm hover:bg-orange-50 hover:border-orange-200 inline-flex items-center gap-1.5 transition-colors font-medium text-gray-700"
            >
              <X size={16} className="shrink-0" aria-hidden />
              Quitar todas
            </button>
          </div>
          <section className="min-w-0 order-1 sm:order-2 sm:text-right">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tu estado (para las 4 preguntas de tu estado)
            </label>
            <select
              value={selectedStateCode ?? ""}
              onChange={(e) => {
                const code = e.target.value || null;
                setSelectedStateCode(code);
                setStoredStateCode(code);
                if (isAuthEnabled && user)
                  updateProfileState(code).catch(() => {});
              }}
              className="w-full sm:max-w-xs h-11 rounded-xl border-2 border-slate-200 bg-white py-2.5 px-3 text-gray-800 shadow-sm sm:ml-auto"
            >
              <option value="">— Seleccionar estado —</option>
              {states.map((s) => (
                <option key={s.stateCode} value={s.stateCode}>
                  {s.name}
                </option>
              ))}
            </select>
          </section>
        </div>

        <p className="text-xs text-gray-500 mb-2">
          {selectedIds.size} de {questions.length} seleccionadas
        </p>
        <div className="flex flex-col gap-2 max-h-[60vh] sm:max-h-[45vh] overflow-x-hidden overflow-y-auto mb-6 pr-1 min-w-0 w-full">
          {questions.map((q, index) => (
            <label
              key={q._id}
              className="flex items-start gap-3 w-full max-w-full min-w-0 py-4 px-3 border-2 border-slate-200 rounded-xl bg-white cursor-pointer hover:bg-orange-50/50 hover:border-orange-200 transition-colors"
            >
              <span className="relative shrink-0 flex items-center justify-center w-[22px] h-[22px] flex-shrink-0">
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
                  {selectedIds.has(q._id) && (
                    <Check
                      size={14}
                      className="text-amber-600 shrink-0"
                      aria-hidden
                    />
                  )}
                </span>
              </span>
              <span className="block min-w-0 flex-1 py-0.5 text-gray-800 text-sm text-left break-words [overflow-wrap:anywhere]">
                {index + 1}. {questionDisplayText(q, displayLang)}
              </span>
            </label>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-200">
          <button
            onClick={startStudy}
            disabled={selectedIds.size === 0}
            className="w-full rounded-xl py-3.5 px-6 bg-slate-200 border-2 border-slate-300 hover:bg-orange-100 hover:border-orange-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Repasar {selectedIds.size} tarjeta
            {selectedIds.size !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </main>
  );
}
