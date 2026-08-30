"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { X, Check, ChevronLeft, ChevronRight } from "lucide-react";
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
import QuestionsLoadError from "../components/QuestionsLoadError";
import LangSelect from "../components/LangSelect";
import PageHeadingWithIcon from "../components/PageHeadingWithIcon";

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
  const selectionInitialized = useRef(false);

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
        setSelectedIds((prev) => {
          if (selectionInitialized.current) return prev;
          selectionInitialized.current = true;
          return new Set(response.data.map((q: QuestionItem) => q._id));
        });
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

  const allSelected =
    questions.length > 0 && selectedIds.size === questions.length;

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
    return <QuestionsLoadError message={error} variant="repasar" />;
  }

  if (view === "study") {
    if (selectedQuestions.length === 0) {
      return (
        <main className="flex flex-col w-full justify-center page-top">
          <p className="text-center text-brand-muted">
            No hay preguntas seleccionadas.
          </p>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setView("select")}
              className="text-brand-muted hover:text-ink-deep hover:underline"
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
      <main className="flex flex-col w-full justify-center page-top pb-16">
        <div className="w-full px-6 sm:px-8">
          <div className="w-full mb-0 page-title-in">
            <PageHeadingWithIcon
              iconSrc="/icon_quiz_review.png"
              title="Repasar"
            />
          </div>
          <div
            className="flex flex-wrap items-center justify-between gap-2 mb-4 page-content-in opacity-0"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-sm text-brand-muted">
              {currentIndex + 1} / {studyQueue.length}
              {showWrongOnly && " (solo incorrectas)"}
            </span>
            <button
              onClick={() => setView("select")}
              className="text-sm text-brand-muted hover:text-ink hover:underline"
            >
              Cambiar preguntas
            </button>
          </div>

          <div
            className="card-raised min-h-[200px] flex flex-col items-center justify-center p-6 cursor-pointer select-none touch-manipulation page-content-in opacity-0"
            style={{ animationDelay: "0.2s" }}
            onClick={() => setFlipped((f) => !f)}
          >
            {!flipped ? (
              <p className="text-lg font-semibold text-ink text-center">
                {questionDisplayText(currentQuestion, displayLang)}
              </p>
            ) : (
              <div className="text-center w-full">
                <p className="text-xs font-medium text-brand-muted/70 uppercase tracking-wide mb-3">
                  Respuesta
                </p>
                {currentQuestion.isStateSpecific ? (
                  <div className="p-3 rounded-lg bg-coral-soft border border-coral/40 text-left inline-block">
                    {stateDetails ? (
                      <ul className="text-sm text-ink space-y-0.5">
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
                      <p className="text-sm text-ink">
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
                        className="text-base text-ink"
                      >
                        {answerDisplayText(a, displayLang)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <p className="text-xs text-brand-muted/70 mt-4">
              Toca la tarjeta para voltear
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!flipped}
                onClick={(e) => {
                  e.stopPropagation();
                  markCurrent(true);
                }}
                className="btn-success-soft py-2.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Correcto
              </button>
              <button
                type="button"
                disabled={!flipped}
                onClick={(e) => {
                  e.stopPropagation();
                  markCurrent(false);
                }}
                className="btn-danger-soft py-2.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Incorrecto
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <LangSelect value={displayLang} onChange={setDisplayLang} />
              <div className="flex gap-2 ml-3 sm:ml-5">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex((i) => Math.max(0, i - 1));
                    setFlipped(false);
                  }}
                  disabled={currentIndex === 0}
                  className="btn-tile h-11 w-11 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Anterior"
                >
                  <ChevronLeft size={22} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex((i) =>
                      i >= studyQueue.length - 1 ? 0 : i + 1,
                    );
                    setFlipped(false);
                  }}
                  className="btn-tile h-11 w-11 p-0"
                  aria-label={
                    currentIndex >= studyQueue.length - 1
                      ? "Primera"
                      : "Siguiente"
                  }
                >
                  <ChevronRight size={22} aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6 pt-4 border-t border-[var(--border-paper)]">
            {wrongCount > 0 && !showWrongOnly && (
              <button
                onClick={startWrongOnly}
                className="btn-tile py-2 px-4 text-sm font-medium"
              >
                Repasar solo incorrectas ({wrongCount})
              </button>
            )}
            {showWrongOnly && (
              <button
                onClick={backToAll}
                className="btn-tile py-2 px-4 text-sm font-medium"
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
    <main className="flex flex-col w-full justify-center page-top pb-16">
      <div className="w-full px-6 sm:px-8">
        <div className="w-full mb-0 page-title-in">
          <PageHeadingWithIcon
            iconSrc="/icon_quiz_review.png"
            title="Repasar"
            subtitle="Elige las preguntas que quieres repasar y estudia con tarjetas."
          />
        </div>

        <div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-start gap-4 mb-6 page-content-in opacity-0"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex flex-col sm:flex-row gap-4 min-w-0">
            <section className="min-w-0 sm:text-left">
              <label className="block text-sm font-medium text-ink mb-1.5">
                Tu estado
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
                className="select-raised sm:max-w-xs"
              >
                <option value="">— Seleccionar estado —</option>
                {states.map((s) => (
                  <option key={s.stateCode} value={s.stateCode}>
                    {s.name}
                  </option>
                ))}
              </select>
            </section>
            <section className="min-w-0">
              <label className="block text-sm font-medium text-ink mb-1.5">
                Idioma
              </label>
              <LangSelect value={displayLang} onChange={setDisplayLang} />
            </section>
          </div>
          <div className="flex gap-2 shrink-0 sm:pb-0">
            <button
              type="button"
              onClick={selectAll}
              aria-pressed={allSelected}
              className="btn-tile h-11 px-3.5 text-sm font-medium gap-2"
            >
              Todas
              <span
                className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full ${
                  allSelected
                    ? "bg-emerald-500 text-white"
                    : "border-2 border-current text-current opacity-45"
                }`}
                aria-hidden
              >
                <Check size={12} strokeWidth={3} />
              </span>
            </button>
            <button
              type="button"
              onClick={deselectAll}
              disabled={selectedIds.size === 0}
              className="btn-tile h-11 px-3.5 text-sm font-medium gap-2"
            >
              Quitar todas
              <span
                className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-coral)] text-white"
                aria-hidden
              >
                <X size={12} strokeWidth={3} />
              </span>
            </button>
          </div>
        </div>

        <p className="text-xs text-brand-muted mb-2">
          {selectedIds.size} de {questions.length} seleccionadas
        </p>
        <div className="flex flex-col gap-2 max-h-[60vh] sm:max-h-[45vh] overflow-x-hidden overflow-y-auto mb-6 pr-1 min-w-0 w-full">
          {questions.map((q, index) => (
            <label
              key={q._id}
              className="flex items-start gap-3 w-full max-w-full min-w-0 py-4 px-3 border-2 border-[var(--border-paper)] rounded-xl bg-white cursor-pointer hover:bg-coral-soft/50 hover:border-coral/40 transition-colors"
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
                      ? "border-coral bg-coral-soft"
                      : "border-[var(--border-paper)]"
                  }`}
                  aria-hidden
                >
                  {selectedIds.has(q._id) && (
                    <Check
                      size={14}
                      className="text-coral shrink-0"
                      aria-hidden
                    />
                  )}
                </span>
              </span>
              <span className="block min-w-0 flex-1 py-0.5 text-ink text-sm text-left break-words [overflow-wrap:anywhere]">
                {index + 1}. {questionDisplayText(q, displayLang)}
              </span>
            </label>
          ))}
        </div>

        <div className="pt-2 border-t border-[var(--border-paper)]">
          <button
            onClick={startStudy}
            disabled={selectedIds.size === 0}
            className="btn-brand w-full py-3.5 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Repasar {selectedIds.size} tarjeta
            {selectedIds.size !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </main>
  );
}
