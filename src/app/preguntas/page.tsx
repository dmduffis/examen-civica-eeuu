"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Download } from "lucide-react";
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

export default function PreguntasPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayLang, setDisplayLang] = useState<DisplayLang>("es");
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

  return (
    <main className="flex flex-col w-full justify-center page-top pb-16">
      <div className="w-full px-6 sm:px-8">
        <div className="w-full mb-0 page-title-in">
          <PageHeadingWithIcon
            iconSrc="/icon_quiz_questions.png"
            title="Lista de Preguntas"
            subtitle="Hay 100 preguntas en total; en la entrevista te harán 20 de forma oral. Aquí puedes estudiarlas todas con sus respuestas correctas."
          />
        </div>
        <div
          className="flex flex-col sm:flex-row gap-8 justify-between items-end w-full mb-10 page-content-in opacity-0"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto min-w-0">
            <section className="min-w-0 w-full sm:max-w-xs">
              <label className="block text-sm font-medium text-ink mb-1.5">
                Tu estado
              </label>
              <select
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
            <section className="min-w-0 w-full sm:w-auto">
              <label className="block text-sm font-medium text-ink mb-1.5">
                Idioma
              </label>
              <LangSelect value={displayLang} onChange={setDisplayLang} />
            </section>
          </div>
          <div className="w-full sm:w-auto shrink-0">
            <button
              type="button"
              className="btn-tile w-full sm:w-auto py-2.5 px-4 font-medium gap-2"
              aria-label="Descargar PDF"
            >
              <Download size={18} aria-hidden />
              Descargar PDF
            </button>
          </div>
        </div>

        <div
          className="flex flex-col gap-8 page-content-in opacity-0"
          style={{ animationDelay: "0.2s" }}
        >
          {questions.map((q, index) => (
            <article key={q._id} className="card-raised p-4 sm:p-5">
              <p className="font-semibold mb-3">
                {index + 1}. {questionDisplayText(q, displayLang)}
              </p>
              {q.isStateSpecific && (
                <div className="mb-3 p-3 rounded-lg bg-coral-soft border border-coral/40">
                  <p className="text-sm text-ink font-medium mb-1">
                    Pregunta de tu estado — busca la respuesta según donde
                    vives.
                  </p>
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
                    <p className="text-xs text-brand-muted">
                      Elige tu estado arriba para ver las respuestas de tu
                      estado aquí.
                    </p>
                  )}
                </div>
              )}
              <ul className="space-y-2">
                {q.answers
                  .filter((answer) => answer.isCorrect)
                  .map((answer, aIdx) => (
                    <li
                      key={answer._id ?? `a-${aIdx}`}
                      className="pl-3 py-1 rounded"
                    >
                      {answerDisplayText(answer, displayLang)}
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </div>

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
