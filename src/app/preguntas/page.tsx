"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Settings2,
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

type PageSize = 10 | 20 | "all";

export default function PreguntasPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayLang, setDisplayLang] = useState<DisplayLang>("es");
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [states, setStates] = useState<StateOption[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState<string | null>(
    null,
  );
  const [stateDetails, setStateDetails] = useState<StateDetails | null>(null);
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
    const load = async () => {
      try {
        const response = await axios.get(backendUrl("/api/question"), {
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

  const totalPages =
    pageSize === "all"
      ? 1
      : Math.max(1, Math.ceil(questions.length / pageSize));

  const visibleQuestions = useMemo(() => {
    if (pageSize === "all") return questions;
    const start = (page - 1) * pageSize;
    return questions.slice(start, start + pageSize);
  }, [questions, page, pageSize]);

  const pageStartIndex = pageSize === "all" ? 0 : (page - 1) * pageSize;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] w-full flex-col items-center justify-center">
        <BeatLoader color="rgba(214, 169, 54, 0.6)" speedMultiplier={0.5} />
      </main>
    );
  }

  if (error) {
    return <QuestionsLoadError message={error} />;
  }

  const handleStateChange = (stateCode: string | null) => {
    setSelectedStateCode(stateCode);
    setStoredStateCode(stateCode);
    if (isAuthEnabled && user) {
      updateProfileState(stateCode).catch(() => {});
    }
  };

  const handlePageSizeChange = (size: PageSize) => {
    setPageSize(size);
    setPage(1);
  };

  const selectedStateName =
    states.find((s) => s.stateCode === selectedStateCode)?.name ?? null;
  const pageSizeLabel = pageSize === "all" ? "Todas" : String(pageSize);
  const langLabel = displayLang === "es" ? "Español" : "English";
  const filtersSummary = [
    selectedStateName ?? "Sin estado",
    langLabel,
    `${pageSizeLabel} / pág.`,
  ].join(" · ");

  return (
    <main className="flex flex-col w-full justify-center page-top pb-16">
      <div className="w-full px-6 sm:px-8">
        <div className="w-full mb-0 page-title-in">
          <PageHeadingWithIcon
            iconSrc="/icon_quiz_questions.png"
            title="Lista de Preguntas"
            subtitle="Hay 100 preguntas en total; en la entrevista te harán 20 de forma oral."
          />
        </div>

        <div
          className="mb-8 sm:mb-10 page-content-in opacity-0 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Mobile: collapsible header */}
          <button
            type="button"
            className="sm:hidden flex w-full items-center justify-between gap-3 rounded-xl border-2 border-[var(--border-paper)] bg-white px-3.5 py-3 text-left"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="preguntas-filters"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <Settings2 size={18} className="shrink-0 text-ink" aria-hidden />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">
                  Configuración
                </span>
                {!filtersOpen ? (
                  <span className="mt-0.5 block truncate text-xs text-brand-muted">
                    {filtersSummary}
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
            id="preguntas-filters"
            className={`${filtersOpen ? "flex" : "hidden"} sm:contents flex-col gap-4 w-full`}
          >
            <section className="min-w-0 w-full sm:w-auto sm:max-w-xs sm:min-w-[14rem]">
              <label
                htmlFor="preguntas-state"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Tu estado
              </label>
              <select
                id="preguntas-state"
                value={selectedStateCode ?? ""}
                onChange={(e) => handleStateChange(e.target.value || null)}
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

            <div className="grid grid-cols-2 gap-3 w-full sm:contents">
              <section className="min-w-0 sm:w-auto">
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Idioma
                </label>
                <LangSelect
                  value={displayLang}
                  onChange={setDisplayLang}
                  className="w-full min-w-0 sm:w-auto"
                />
              </section>
              <section className="min-w-0 sm:w-auto">
                <label
                  htmlFor="preguntas-page-size"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Por página
                </label>
                <select
                  id="preguntas-page-size"
                  value={pageSize === "all" ? "all" : String(pageSize)}
                  onChange={(e) => {
                    const v = e.target.value;
                    handlePageSizeChange(
                      v === "all" ? "all" : (Number(v) as 10 | 20),
                    );
                  }}
                  className="select-raised w-full min-w-0 sm:w-auto"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="all">Todas</option>
                </select>
              </section>
            </div>
          </div>

          <div className="w-full sm:w-auto sm:ml-auto shrink-0">
            <button
              type="button"
              className="btn-brand w-full gap-2 px-4 py-2.5 font-medium sm:w-auto"
              aria-label="Descargar PDF"
            >
              Descargar PDF
              <FileDown size={18} aria-hidden />
            </button>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 page-content-in opacity-0"
          style={{ animationDelay: "0.2s" }}
        >
          {visibleQuestions.map((q, index) => (
            <article key={q._id} className="card-raised p-3 sm:p-4">
              <p className="font-semibold text-sm sm:text-[0.9375rem] leading-snug mb-1.5">
                {pageStartIndex + index + 1}.{" "}
                {questionDisplayText(q, displayLang)}
              </p>
              {q.isStateSpecific && (
                <div className="mb-1.5 p-2.5 rounded-lg bg-coral-soft border border-coral/40">
                  <p className="text-xs text-ink font-medium mb-1">
                    Pregunta de tu estado — busca la respuesta según donde
                    vives.
                  </p>
                  {stateDetails ? (
                    <ul className="text-xs text-ink space-y-0.5">
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
                    <p className="text-xs text-brand-muted">
                      Elige tu estado arriba para ver las respuestas de tu
                      estado aquí.
                    </p>
                  )}
                </div>
              )}
              <ul className="space-y-0.5">
                {q.answers
                  .filter((answer) => answer.isCorrect)
                  .map((answer, aIdx) => (
                    <li
                      key={answer._id ?? `a-${aIdx}`}
                      className="text-sm text-brand-muted leading-snug"
                    >
                      {answerDisplayText(answer, displayLang)}
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </div>

        {pageSize !== "all" && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              type="button"
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
              }}
              disabled={page <= 1}
              className="btn-tile h-11 w-11 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <ChevronLeft size={22} aria-hidden />
            </button>
            <span className="text-sm font-medium text-ink tabular-nums min-w-[5.5rem] text-center">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
              }}
              disabled={page >= totalPages}
              className="btn-tile h-11 w-11 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página siguiente"
            >
              <ChevronRight size={22} aria-hidden />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mt-8 w-full">
          <button
            type="button"
            onClick={() =>
              window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
            }
            className="btn-tile w-full sm:w-auto py-2 px-4 font-medium gap-2"
            aria-label="Volver arriba"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
            Volver arriba
          </button>
          <Link href="/quiz" className="btn-brand w-full sm:w-auto py-2 px-4">
            Tomar el Quiz
          </Link>
        </div>
      </div>
    </main>
  );
}
