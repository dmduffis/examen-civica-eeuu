"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Mic,
  Check,
  Headphones,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import { BeatLoader } from "react-spinners";
import { VoiceBars } from "../components/VoiceBars";
import EntrevistaLoadErrorIllustration from "../components/EntrevistaLoadErrorIllustration";
import PageHeadingWithIcon from "../components/PageHeadingWithIcon";
import ProDiamond from "../components/ProDiamond";
import { backendUrl } from "../lib/backend-url";

type InterviewQuestion = {
  id: string;
  questionText: string;
  questionTextEn?: string;
  questionAudio: string;
};

const CONNECTION_ERROR_ES =
  "No se pudo conectar. Comprueba tu conexión a internet e inténtalo de nuevo.";

const interviewSteps: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Headphones,
    title: "Escucha",
    description:
      "La pregunta se reproduce en inglés, como en la entrevista real.",
  },
  {
    icon: Mic,
    title: "Responde",
    description: "Habla en voz alta con el micrófono cuando sea tu turno.",
  },
  {
    icon: ClipboardCheck,
    title: "Revisa",
    description: "Al final verás cómo te fue y qué puedes mejorar.",
  },
];

/** Show user-friendly message; hide technical details from backend/env. */
function friendlyError(msg: string | undefined): string {
  if (!msg?.trim()) return CONNECTION_ERROR_ES;
  const m = msg.toLowerCase();
  if (
    m.includes("backend") ||
    m.includes("next_public") ||
    m.includes("configurado") ||
    m.includes("desplegado") ||
    m.includes("timeout") ||
    m.includes("not configured")
  )
    return CONNECTION_ERROR_ES;
  if (
    m.includes("elevenlabs") ||
    m.includes("tts") ||
    m.includes("stt") ||
    m.includes("payment_required") ||
    m.includes("payment_issue") ||
    m.includes("payment") ||
    m.includes("subscription") ||
    m.includes("invoice") ||
    m.includes('"detail"') ||
    m.includes("request_id") ||
    (m.includes("voice") &&
      (m.includes("not available") ||
        m.includes("no está") ||
        m.includes("401") ||
        m.includes("402") ||
        m.includes("403") ||
        m.includes("429") ||
        m.includes("500") ||
        m.includes("502") ||
        m.includes("503")))
  )
    return "El servicio de voz no está disponible en este momento. Inténtalo de nuevo más tarde.";
  // Hide raw JSON / provider dumps
  if (m.includes("{") || m.includes("http") || /:\s*\d{3}\b/.test(m))
    return "El servicio de voz no está disponible en este momento. Inténtalo de nuevo más tarde.";
  return msg;
}

/**
 * Extract only the suggested correct answer for "Correct answer:" in the review.
 * Never show "a stronger answer" in the UI.
 */
function correctAnswerFromSuggestion(text: string): string {
  const t = text.trim();
  const strongerMatch = t.match(
    /\b(?:A\s+)?stronger\s+answer\s*:?\s*([\s\S]*)/i,
  );
  let out: string;
  if (strongerMatch) {
    let rest = strongerMatch[1].trim();
    if (rest.startsWith('"') && rest.includes('"', 1)) {
      const end = rest.indexOf('"', 1);
      rest = rest.slice(1, end);
    }
    out = rest.trim() || t;
  } else {
    out =
      t
        .replace(
          /^.*?(?:Your\s+answer|Answer)\s*:?\s*["\u201C\u201D]?[^"]*["\u201C\u201D]?\.?\s*/i,
          "",
        )
        .trim() || t;
  }
  return (
    out.replace(/\b(?:A\s+)?stronger\s+answer\s*:?\s*/gi, "").trim() || out
  );
}

/** Interview is in English only: backend questionText is Spanish, so we show questionTextEn when present. */
function interviewQuestionLabel(q: InterviewQuestion): string | null {
  const en = q.questionTextEn?.trim();
  return en || null;
}

type ReviewItem = {
  questionText: string;
  questionTextEn?: string;
  questionTextEs?: string;
  userAnswer: string;
  suggestionEn: string;
  suggestionEs: string;
};

type StartResponse = {
  sessionId: string;
  greetingText: string;
  greetingAudio: string;
  questions: InterviewQuestion[];
};

type RespondResponse = {
  transcribedText: string;
  officerResponseText: string;
  officerResponseAudio: string;
  isComplete: boolean;
  nextQuestion?: { questionText: string; questionAudio: string };
  review?: { items: ReviewItem[] };
};

function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playBase64 = useCallback((base64: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        audioRef.current = audio;
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Playback failed"));
        audio.play().catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { playBase64, stop };
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      resolve(base64 ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Yield so the browser can paint the new screen and start CSS animations before we play audio. */
function afterNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 80);
      });
    });
  });
}

/** Start generates 6 audios (15–45s); use at least 90s. */
/** Longest single answer recording (matches typical oral-test pace). */
const MAX_RECORDING_MS = 20_000;

const VOICE_START_TIMEOUT_MS = 90_000;
/** Respond does STT + TTS (5–15s); use at least 60s. */
const VOICE_RESPOND_TIMEOUT_MS = 60_000;
const RETRY_DELAYS_MS = [0, 2000, 4000];

/**
 * Fetch with timeout and retries. Handles cold starts and transient 502/503/network errors.
 * Retries up to 3 times with 2s then 4s delay. Does not retry 4xx.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  opts: { retries?: number; timeoutMs?: number } = {},
): Promise<Response> {
  const { retries = 3, timeoutMs = VOICE_START_TIMEOUT_MS } = opts;
  let lastRes: Response | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt] ?? 4000));
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.status < 500) return res;
      lastRes = res;
    } catch (e) {
      clearTimeout(timeoutId);
      lastRes = null;
      if (attempt === retries - 1) throw e;
    }
  }
  return lastRes!;
}

export default function InterviewPage() {
  const [status, setStatus] = useState<
    | "idle"
    | "loading"
    | "greeting"
    | "question"
    | "ready_to_record"
    | "recording"
    | "sending"
    | "officer"
    | "review"
    | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [userName, setUserName] = useState("");
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(
    null,
  );
  const [recordingRecorder, setRecordingRecorder] =
    useState<MediaRecorder | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingMimeRef = useRef<string>("audio/webm");
  const maxRecordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const stopRecordingAndSendRef = useRef<() => Promise<void>>(async () => {});
  const { playBase64, stop } = useAudioPlayer();

  useEffect(() => {
    return () => {
      if (maxRecordingTimerRef.current) {
        clearTimeout(maxRecordingTimerRef.current);
        maxRecordingTimerRef.current = null;
      }
    };
  }, []);

  const startInterview = useCallback(async () => {
    setError(null);
    setStatus("loading");
    try {
      const res = await fetchWithRetry(
        backendUrl("/api/voice/interview/start"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userName ? { userName } : {}),
        },
        { retries: 3, timeoutMs: VOICE_START_TIMEOUT_MS },
      );
      const data = (await res.json()) as StartResponse & { message?: string };
      if (res.status === 503 && data.message) {
        setError(friendlyError(data.message));
        setStatus("error");
        return;
      }
      if (!res.ok) {
        const msg = data.message ?? "No se pudo iniciar la entrevista.";
        setError(res.status === 502 ? CONNECTION_ERROR_ES : friendlyError(msg));
        setStatus("error");
        return;
      }
      setSessionId(data.sessionId);
      setQuestions(data.questions ?? []);
      setQuestionIndex(0);
      setReviewItems([]);
      setStatus("greeting");
      setIsPlayingAudio(true);
      await afterNextPaint();
      await playBase64(data.greetingAudio);
      setIsPlayingAudio(false);
      if (data.questions?.length) {
        setStatus("question");
        setIsPlayingAudio(true);
        await afterNextPaint();
        await playBase64(data.questions[0].questionAudio);
        setIsPlayingAudio(false);
        setStatus("ready_to_record");
      } else {
        setStatus("idle");
      }
    } catch (e) {
      setError(CONNECTION_ERROR_ES);
      setStatus("error");
    }
  }, [userName, playBase64]);

  const startRecording = useCallback(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "El micrófono no está disponible. Abre la página con HTTPS (no HTTP).",
      );
      setStatus("error");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (maxRecordingTimerRef.current) {
          clearTimeout(maxRecordingTimerRef.current);
          maxRecordingTimerRef.current = null;
        }
        streamRef.current = stream;
        setRecordingStream(stream);
        chunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "";
        recordingMimeRef.current = mimeType || "audio/webm";
        const recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined,
        );
        recorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size) chunksRef.current.push(e.data);
        };
        recorder.start();
        setRecordingRecorder(recorder);
        setStatus("recording");
        maxRecordingTimerRef.current = setTimeout(() => {
          maxRecordingTimerRef.current = null;
          if (recorderRef.current?.state === "recording") {
            void stopRecordingAndSendRef.current();
          }
        }, MAX_RECORDING_MS);
      })
      .catch((e) => {
        const msg =
          e?.name === "NotAllowedError"
            ? "Permiso de micrófono denegado. Permite el acceso en la configuración del navegador."
            : e?.name === "NotFoundError"
              ? "No se encontró ningún micrófono."
              : "No se pudo acceder al micrófono. Usa HTTPS y permite el micrófono cuando lo pida el navegador.";
        setError(msg);
        setStatus("error");
      });
  }, []);

  const stopRecordingAndSend = useCallback(async () => {
    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }
    const recorder = recorderRef.current;
    const stream = streamRef.current;
    if (!recorder || recorder.state !== "recording") return;
    stop();
    recorder.stop();
    stream?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setRecordingStream(null);
    setRecordingRecorder(null);
    recorderRef.current = null;
    setStatus("sending");
    try {
      await new Promise<void>((r) => setTimeout(r, 300));
      const blob = new Blob(chunksRef.current, {
        type: recordingMimeRef.current,
      });
      const audioBase64 = await blobToBase64(blob);
      const res = await fetchWithRetry(
        backendUrl("/api/voice/interview/respond"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            questionIndex,
            audio: audioBase64,
          }),
        },
        { retries: 3, timeoutMs: VOICE_RESPOND_TIMEOUT_MS },
      );
      const data = (await res.json()) as RespondResponse & { message?: string };
      if (res.status === 503 && data.message) {
        setError(friendlyError(data.message));
        setStatus("error");
        return;
      }
      if (!res.ok) {
        const msg = data.message ?? "Error al enviar la respuesta.";
        setError(friendlyError(msg));
        setStatus("error");
        return;
      }
      setStatus("officer");
      setIsPlayingAudio(true);
      await afterNextPaint();
      await playBase64(data.officerResponseAudio);
      setIsPlayingAudio(false);
      if (data.isComplete && data.review?.items) {
        setReviewItems(data.review.items);
        setStatus("review");
        return;
      }
      if (data.nextQuestion && questionIndex + 1 < (questions?.length ?? 0)) {
        const nextIdx = questionIndex + 1;
        setQuestionIndex(nextIdx);
        setStatus("question");
        setIsPlayingAudio(true);
        await afterNextPaint();
        await playBase64(data.nextQuestion.questionAudio);
        setIsPlayingAudio(false);
        setStatus("ready_to_record");
      } else {
        setStatus("idle");
      }
    } catch (e) {
      setError(CONNECTION_ERROR_ES);
      setStatus("error");
    }
  }, [sessionId, questionIndex, questions?.length, playBase64]);

  stopRecordingAndSendRef.current = stopRecordingAndSend;

  const isStartScreen = status === "idle";

  return (
    <main className="flex flex-col w-full justify-center page-top pb-16">
      <div className="w-full min-w-0 px-6 sm:px-8">
        {isStartScreen ? (
          <>
            <div className="w-full mb-0 page-title-in">
              <PageHeadingWithIcon
                iconSrc="/icon_quiz_interview.png"
                title="Entrevista de Práctica"
                subtitle="Practica en inglés con audio: escucha y responde en voz alta."
                priority
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,3fr)_minmax(0,4fr)] gap-8 sm:gap-32 items-start w-full min-w-0">
              <div className="order-2 sm:order-1 w-full min-w-0">
                {status === "idle" && (
                  <div
                    className="flex flex-col gap-6 page-content-in opacity-0"
                    style={{ animationDelay: "0.15s" }}
                  >
                    <ol
                      className="list-none m-0 p-0 mb-4 sm:mb-6"
                      aria-label="Cómo funciona la entrevista"
                    >
                      {interviewSteps.map(
                        ({ icon: Icon, title, description }) => (
                          <li
                            key={title}
                            className="home-step home-step--compact"
                          >
                            <span className="home-step-icon" aria-hidden>
                              <Icon size={18} strokeWidth={2.25} />
                            </span>
                            <div className="min-w-0">
                              <p className="home-step-title text-ink">
                                {title}
                              </p>
                              <p className="home-step-desc">{description}</p>
                            </div>
                          </li>
                        ),
                      )}
                    </ol>

                    <div>
                      <label
                        htmlFor="userName"
                        className="block text-sm font-medium text-ink mb-1"
                      >
                        Tu nombre (opcional)
                      </label>
                      <input
                        id="userName"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full rounded-xl border-2 border-[var(--border-paper)] px-4 py-2 text-ink"
                        placeholder="Ej. María"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={startInterview}
                      className="btn-brand inline-flex items-center justify-center gap-2 py-4 px-6"
                    >
                      Iniciar entrevista
                      <ProDiamond className="h-4 w-4 translate-y-0 text-white" />
                    </button>
                  </div>
                )}
              </div>

              <div
                className="order-1 sm:order-2 flex justify-center sm:justify-start items-center min-w-0 home-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <Image
                  src="/office_quiz_question.png"
                  width={1122}
                  height={1402}
                  alt="Oficial de práctica para la entrevista"
                  className="w-[min(100%,220px)] sm:w-[min(100%,440px)] h-auto object-contain"
                  priority
                />
              </div>
            </div>
          </>
        ) : (
          /* Interview in progress: no image, single column */
          <div className="max-w-2xl mx-auto w-full">
            <div className="w-full mb-0 page-title-in">
              <PageHeadingWithIcon
                iconSrc="/icon_quiz_interview.png"
                title="Entrevista de Práctica"
                titleClassName="page-heading mb-0"
              />
            </div>

            {status === "loading" && (
              <div className="flex flex-col items-center gap-6">
                <BeatLoader
                  color="rgba(214, 169, 54, 0.6)"
                  speedMultiplier={0.5}
                />
                <p className="text-brand-muted">Preparando tu entrevista…</p>
              </div>
            )}

            {(status === "greeting" || status === "question") && (
              <div className="flex flex-col items-center gap-6">
                <VoiceBars
                  isPlaying={isPlayingAudio}
                  className="flex-shrink-0"
                />
                <p className="text-brand-muted">
                  {status === "greeting" && "Reproduciendo bienvenida…"}
                  {status === "question" && "Reproduciendo pregunta…"}
                </p>
              </div>
            )}

            {status === "ready_to_record" && questions[questionIndex] && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <VoiceBars className="flex-shrink-0" />
                </div>
                <p className="text-ink font-medium">
                  Pregunta {questionIndex + 1} de {questions.length}
                </p>
                {(() => {
                  const label = interviewQuestionLabel(
                    questions[questionIndex],
                  );
                  return label ? (
                    <p className="text-brand-muted italic">
                      &quot;{label}&quot;
                    </p>
                  ) : (
                    <p className="text-brand-muted">
                      Escucha la pregunta en inglés en el audio y responde con
                      el micrófono.
                    </p>
                  );
                })()}
                <p className="text-brand-muted text-sm">
                  Haz clic para abrir el micrófono y grabar tu respuesta.
                </p>
                <button
                  type="button"
                  onClick={startRecording}
                  className="btn-royal py-4 px-6 gap-2"
                  aria-label="Abrir micrófono"
                >
                  <Mic size={22} aria-hidden />
                  Abrir micrófono
                </button>
              </div>
            )}

            {status === "recording" && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <VoiceBars
                    mediaRecorder={recordingRecorder}
                    className="flex-shrink-0"
                  />
                </div>
                <p className="text-ink font-medium">
                  Pregunta {questionIndex + 1} de {questions.length}: grabando
                  tu respuesta.
                </p>
                {questions[questionIndex] &&
                  interviewQuestionLabel(questions[questionIndex]) && (
                    <p className="text-brand-muted italic">
                      &quot;{interviewQuestionLabel(questions[questionIndex])}
                      &quot;
                    </p>
                  )}
                <button
                  type="button"
                  onClick={stopRecordingAndSend}
                  className="btn-danger py-4 px-6 gap-2"
                  aria-label="Dejar de grabar y enviar"
                >
                  <span
                    className="inline-flex h-2.5 w-2.5 rounded-full bg-white animate-pulse"
                    aria-hidden
                  />
                  Grabando
                </button>
              </div>
            )}

            {status === "sending" && (
              <div className="flex flex-col items-center gap-6">
                <BeatLoader
                  color="rgba(214, 169, 54, 0.6)"
                  speedMultiplier={0.5}
                />
                <p className="text-brand-muted">Enviando respuesta…</p>
              </div>
            )}

            {status === "officer" && (
              <div className="flex flex-col items-center gap-6">
                <VoiceBars
                  isPlaying={isPlayingAudio}
                  className="flex-shrink-0"
                />
                <p className="text-brand-muted">Respuesta del oficial…</p>
              </div>
            )}

            {status === "review" && reviewItems.length > 0 && (
              <div className="space-y-8 w-full">
                <h2 className="text-xl font-bold text-[var(--title-blue)] page-title-in">
                  Resumen de la entrevista
                </h2>
                <ul className="space-y-4 w-full">
                  {reviewItems.map((item, i) => {
                    const correctAnswer = correctAnswerFromSuggestion(
                      item.suggestionEn,
                    );
                    const isCorrect = !/\bstronger\s+answer\b/i.test(
                      item.suggestionEn,
                    );
                    return (
                      <li
                        key={i}
                        className="rounded-xl border-2 border-[var(--border-paper)] bg-white p-4 w-full flex items-start gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-brand-muted mb-2">
                            Tu respuesta:{" "}
                            {item.userAnswer || "(no se detectó voz)"}
                          </p>
                          <p className="text-sm text-ink">
                            Respuesta correcta:{" "}
                            {isCorrect
                              ? "Tu respuesta es aceptable."
                              : correctAnswer}
                          </p>
                        </div>
                        {isCorrect && (
                          <Check
                            size={24}
                            className="shrink-0 text-green-600 self-center"
                            aria-label="Correcto"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setSessionId(null);
                      setQuestions([]);
                      setQuestionIndex(0);
                      setReviewItems([]);
                    }}
                    className="btn-brand py-3 px-6"
                  >
                    Hacer otra entrevista
                  </button>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex w-full flex-col items-center gap-6 text-center">
                <EntrevistaLoadErrorIllustration />
                <div className="w-full max-w-md">
                  <h1 className="page-heading text-ink">
                    ¡Ups! Algo salió mal.
                  </h1>
                  <p className="mt-3 font-medium text-[#b4534a]">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setError(null);
                    }}
                    className="btn-brand mt-6 w-full py-2.5 px-4 sm:w-auto"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
