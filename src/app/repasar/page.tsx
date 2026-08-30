"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  X,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  RotateCcw,
  Settings2,
  ThumbsUp,
} from "lucide-react";
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
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [displayLang, setDisplayLang] = useState<DisplayLang>("es");
  const [filtersOpen, setFiltersOpen] = useState(false);
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
    setKnownIds(new Set());
    setStudyQueue(selectedQuestions);
    setCurrentIndex(0);
    setFlipped(false);
    setFiltersOpen(false);
    setView("study");
  };

  const markAsKnown = () => {
    if (!currentQuestion) return;
    const id = currentQuestion._id;
    const nextQueue = studyQueue.filter((q) => q._id !== id);
    setKnownIds((prev) => new Set(prev).add(id));
    setStudyQueue(nextQueue);
    setCurrentIndex((i) =>
      nextQueue.length === 0 ? 0 : i >= nextQueue.length ? 0 : i,
    );
    setFlipped(false);
  };

  const resetProgress = () => {
    setKnownIds(new Set());
    setStudyQueue(selectedQuestions);
    setCurrentIndex(0);
    setFlipped(false);
  };

  const knownCount = knownIds.size;
  const currentQuestion = studyQueue[currentIndex];
  const correctAnswers =
    currentQuestion?.answers.filter((a) => a.isCorrect) ?? [];

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

    const allKnown = studyQueue.length === 0 && knownCount > 0;
    const needsState = !!currentQuestion?.isStateSpecific && !selectedStateCode;

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
            className="mb-4 page-content-in opacity-0"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-brand-muted">
                {displayLang === "en"
                  ? `${knownCount} of ${selectedQuestions.length} known`
                  : `${knownCount} de ${selectedQuestions.length} conocidas`}
                {!allKnown && studyQueue.length > 0
                  ? ` · ${currentIndex + 1}/${studyQueue.length}`
                  : null}
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[var(--border-paper)] bg-white px-3 py-2 text-sm font-semibold text-ink"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                aria-controls="repasar-study-config"
              >
                <Settings2 size={16} aria-hidden />
                Configuración
                <ChevronDown
                  size={16}
                  className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
            </div>

            <div
              id="repasar-study-config"
              className={`${filtersOpen ? "mt-3 flex" : "hidden"} flex-col gap-3 rounded-xl border-2 border-[var(--border-paper)] bg-white p-3`}
            >
              <section className="min-w-0">
                <label
                  htmlFor="repasar-study-state"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Tu estado
                </label>
                <select
                  id="repasar-study-state"
                  value={selectedStateCode ?? ""}
                  onChange={(e) => {
                    const code = e.target.value || null;
                    setSelectedStateCode(code);
                    setStoredStateCode(code);
                    if (isAuthEnabled && user)
                      updateProfileState(code).catch(() => {});
                  }}
                  className="select-raised"
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
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Idioma
                </label>
                <LangSelect
                  value={displayLang}
                  onChange={setDisplayLang}
                  className="w-full min-w-0"
                />
              </section>
              <button
                type="button"
                onClick={() => setView("select")}
                className="btn-tile w-full py-2.5 px-4 text-sm font-medium"
              >
                Cambiar preguntas
              </button>
            </div>
          </div>

          {allKnown ? (
            <div className="card-raised flex flex-col items-center justify-center gap-4 p-8 text-center page-content-in">
              <p className="text-lg font-semibold text-ink">
                {displayLang === "en"
                  ? "You know them all — nice work!"
                  : "¡Ya las sabes todas!"}
              </p>
              <p className="text-sm text-brand-muted">
                {displayLang === "en"
                  ? "Reset to practice again, or pick other questions."
                  : "Reinicia para practicar de nuevo, o elige otras preguntas."}
              </p>
            </div>
          ) : (
            <div
              className="card-raised min-h-[280px] sm:min-h-[320px] flex flex-col p-6 cursor-pointer select-none touch-manipulation page-content-in opacity-0"
              style={{ animationDelay: "0.2s" }}
              onClick={() => setFlipped((f) => !f)}
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand-muted text-center shrink-0">
                {flipped
                  ? displayLang === "en"
                    ? "Answer"
                    : "Respuesta"
                  : displayLang === "en"
                    ? "Question"
                    : "Pregunta"}
              </p>

              <div className="flex flex-1 flex-col items-center justify-center px-1 py-6 min-h-0 w-full">
                {!flipped ? (
                  <p className="text-lg sm:text-xl font-semibold text-ink text-center text-pretty">
                    {questionDisplayText(currentQuestion, displayLang)}
                  </p>
                ) : currentQuestion.isStateSpecific ? (
                  <div className="p-3 rounded-lg bg-coral-soft border border-coral/40 text-center w-full max-w-md">
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
                  <ul className="space-y-1.5 text-center w-full max-w-md">
                    {correctAnswers.map((a, aIdx) => (
                      <li
                        key={a._id ?? `a-${aIdx}`}
                        className="text-base sm:text-lg text-ink text-pretty"
                      >
                        {answerDisplayText(a, displayLang)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex shrink-0 items-center justify-center gap-2 pt-2 pb-0.5 text-brand-muted">
                <RefreshCw size={16} className="shrink-0" aria-hidden />
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em]">
                  {flipped
                    ? displayLang === "en"
                      ? "Tap to flip back"
                      : "Toca para voltear"
                    : displayLang === "en"
                      ? "Tap to flip"
                      : "Toca para voltear"}
                </span>
              </div>
            </div>
          )}

          {!needsState ? (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={allKnown || !flipped}
                onClick={(e) => {
                  e.stopPropagation();
                  markAsKnown();
                }}
                className="btn-success-soft w-full py-2.5 px-4 gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {displayLang === "en" ? "I know this" : "Lo sé"}
                <ThumbsUp size={16} aria-hidden />
              </button>
              <button
                type="button"
                disabled={knownCount === 0 && !allKnown}
                onClick={(e) => {
                  e.stopPropagation();
                  resetProgress();
                }}
                className="btn-tile w-full py-2.5 px-4 font-medium gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {displayLang === "en" ? "Reset" : "Reiniciar"}
                <RotateCcw size={16} aria-hidden />
              </button>
            </div>
          ) : null}

          {!allKnown && !needsState ? (
            <div className="mt-4 flex justify-center gap-2">
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
          ) : null}
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
          className="mb-6 page-content-in opacity-0 flex flex-col gap-4 sm:flex-row sm:flex-nowrap sm:items-end sm:gap-4"
          style={{ animationDelay: "0.1s" }}
        >
          <button
            type="button"
            className="sm:hidden flex w-full items-center justify-between gap-3 rounded-xl border-2 border-[var(--border-paper)] bg-white px-3.5 py-3 text-left"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="repasar-filters"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <Settings2 size={18} className="shrink-0 text-ink" aria-hidden />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">
                  Configuración
                </span>
                {!filtersOpen ? (
                  <span className="mt-0.5 block truncate text-xs text-brand-muted">
                    {[
                      states.find((s) => s.stateCode === selectedStateCode)
                        ?.name ?? "Sin estado",
                      displayLang === "es" ? "Español" : "English",
                    ].join(" · ")}
                  </span>
                ) : null}
              </span>
            </span>
            <ChevronDown
              size={20}
              className={`shrink-0 text-ink transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>

          <div
            id="repasar-filters"
            className={`${filtersOpen ? "flex" : "hidden"} sm:contents flex-col gap-4 w-full`}
          >
            <section className="min-w-0 w-full sm:w-auto sm:max-w-xs sm:min-w-[12rem] shrink-0">
              <label
                htmlFor="repasar-state"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Tu estado
              </label>
              <select
                id="repasar-state"
                value={selectedStateCode ?? ""}
                onChange={(e) => {
                  const code = e.target.value || null;
                  setSelectedStateCode(code);
                  setStoredStateCode(code);
                  if (isAuthEnabled && user)
                    updateProfileState(code).catch(() => {});
                }}
                className="select-raised"
              >
                <option value="">— Seleccionar estado —</option>
                {states.map((s) => (
                  <option key={s.stateCode} value={s.stateCode}>
                    {s.name}
                  </option>
                ))}
              </select>
            </section>
            <section className="min-w-0 w-full sm:w-auto shrink-0">
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Idioma
              </label>
              <LangSelect
                value={displayLang}
                onChange={setDisplayLang}
                className="w-full min-w-0 sm:w-auto"
              />
            </section>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full shrink-0 sm:ml-auto sm:flex sm:w-auto sm:gap-2">
            <button
              type="button"
              onClick={selectAll}
              aria-pressed={allSelected}
              className="btn-tile h-11 w-full sm:w-auto px-3.5 text-sm font-medium gap-2"
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
              className="btn-tile h-11 w-full sm:w-auto px-3.5 text-sm font-medium gap-2"
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
