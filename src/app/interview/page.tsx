"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Mic } from "lucide-react";
import { BeatLoader } from "react-spinners";
import { VoiceBars } from "../components/VoiceBars";
import { backendUrl } from "../lib/backend-url";
import practiceInterviewHero from "../assets/images/practice_interview_hero.png";

type InterviewQuestion = {
  id: string;
  questionText: string;
  questionTextEn?: string;
  questionAudio: string;
};

const CONNECTION_ERROR_ES =
  "No se pudo conectar. Comprueba tu conexión a internet e inténtalo de nuevo.";
const CONNECTION_ERROR_EN =
  "Couldn't connect. Check your internet connection and try again.";

/** Show user-friendly message; hide technical details from backend/env. */
function friendlyError(msg: string | undefined): string {
  if (!msg?.trim()) return CONNECTION_ERROR_ES;
  const m = msg.toLowerCase();
  if (m.includes("backend") || m.includes("next_public") || m.includes("configurado") || m.includes("desplegado") || m.includes("timeout") || m.includes("not configured")) return CONNECTION_ERROR_ES;
  if (m.includes("voice") && (m.includes("not available") || m.includes("no está"))) return "El servicio de voz no está disponible en este momento.";
  return msg;
}

/**
 * Extract only the suggested correct answer for "Correct answer:" in the review.
 * Never show "a stronger answer" in the UI.
 */
function correctAnswerFromSuggestion(text: string): string {
  const t = text.trim();
  const strongerMatch = t.match(/\b(?:A\s+)?stronger\s+answer\s*:?\s*(.*)/is);
  let out: string;
  if (strongerMatch) {
    let rest = strongerMatch[1].trim();
    if (rest.startsWith('"') && rest.includes('"', 1)) {
      const end = rest.indexOf('"', 1);
      rest = rest.slice(1, end);
    }
    out = rest.trim() || t;
  } else {
    out = t.replace(/^.*?(?:Your\s+answer|Answer)\s*:?\s*["\u201C\u201D]?[^"]*["\u201C\u201D]?\.?\s*/i, "").trim() || t;
  }
  return out.replace(/\b(?:A\s+)?stronger\s+answer\s*:?\s*/gi, "").trim() || out;
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
  opts: { retries?: number; timeoutMs?: number } = {}
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
  const [status, setStatus] = useState<"idle" | "loading" | "greeting" | "question" | "ready_to_record" | "recording" | "sending" | "officer" | "review" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [userName, setUserName] = useState("");
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null);
  const [recordingRecorder, setRecordingRecorder] = useState<MediaRecorder | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingMimeRef = useRef<string>("audio/webm");
  const { playBase64, stop } = useAudioPlayer();

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
        { retries: 3, timeoutMs: VOICE_START_TIMEOUT_MS }
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
      setError("El micrófono no está disponible. Abre la página con HTTPS (no HTTP).");
      setStatus("error");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        setRecordingStream(stream);
        chunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "";
        recordingMimeRef.current = mimeType || "audio/webm";
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        recorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size) chunksRef.current.push(e.data);
        };
        recorder.start();
        setRecordingRecorder(recorder);
        setStatus("recording");
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
      const blob = new Blob(chunksRef.current, { type: recordingMimeRef.current });
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
        { retries: 3, timeoutMs: VOICE_RESPOND_TIMEOUT_MS }
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

  const isStartScreen = status === "idle";

  return (
    <main className="flex flex-col w-full justify-center pt-6 mt-2 sm:pt-16 sm:mt-8 pb-16">
      <div className="w-full min-w-0 px-6 sm:px-8">
        {isStartScreen ? (
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,3fr)_minmax(0,4fr)] gap-8 sm:gap-[5rem] items-start w-full min-w-0 overflow-hidden">
            {/* Content left */}
            <div className="order-2 sm:order-1 w-full min-w-0">
              <h1 className="text-2xl sm:text-[2.5rem] font-bold text-gray-800 mb-2 leading-tight">
                Entrevista de Práctica
              </h1>
              <p className="text-gray-600 mb-8">
                Simula la entrevista con audio: escucha la pregunta, responde en voz alta y recibe retroalimentación en inglés y español.
              </p>

              {status === "idle" && (
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                Tu nombre (opcional)
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 text-gray-800"
                placeholder="Ej. María"
              />
            </div>
            <button
              type="button"
              onClick={startInterview}
              className="rounded-xl bg-amber-500 text-white font-semibold py-4 px-6 hover:bg-amber-600 transition-colors"
            >
              Iniciar entrevista
            </button>
          </div>
            )}
            </div>

            {/* Hero right - only on start screen */}
            <div className="order-1 sm:order-2 flex justify-center sm:justify-start items-center min-w-0">
              <Image
                src={practiceInterviewHero}
                width={560}
                height={560}
                alt="Oficial de práctica para la entrevista"
                className="w-[min(100%,363px)] sm:w-[min(100%,500px)] h-auto"
              />
            </div>
          </div>
        ) : (
          /* Interview in progress: no image, single column */
          <div className="max-w-2xl mx-auto w-full">
            <h1 className="text-2xl sm:text-[2.5rem] font-bold text-gray-800 mb-6 leading-tight text-center">
              Entrevista de Práctica
            </h1>

            {status === "loading" && (
              <div className="flex flex-col items-center gap-6">
                <BeatLoader color="rgba(214, 169, 54, 0.6)" speedMultiplier={0.5} />
                <p className="text-gray-600">Preparando tu entrevista…</p>
              </div>
            )}

            {(status === "greeting" || status === "question") && (
              <div className="flex flex-col items-center gap-6">
                <VoiceBars isPlaying={isPlayingAudio} className="flex-shrink-0" />
                <p className="text-gray-600">
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
                <p className="text-gray-700 font-medium">
                  Pregunta {questionIndex + 1} de {questions.length}
                </p>
                {(() => {
                  const label = interviewQuestionLabel(questions[questionIndex]);
                  return label ? (
                    <p className="text-gray-600 italic">&quot;{label}&quot;</p>
                  ) : (
                    <p className="text-gray-600">Escucha la pregunta en inglés en el audio y responde con el micrófono.</p>
                  );
                })()}
                <p className="text-gray-600 text-sm">Haz clic para abrir el micrófono y grabar tu respuesta.</p>
                <button
                  type="button"
                  onClick={startRecording}
                  className="rounded-xl bg-green-600 text-white font-semibold py-4 px-6 hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2"
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
                  <VoiceBars mediaRecorder={recordingRecorder} className="flex-shrink-0" />
                </div>
                <p className="text-gray-700 font-medium">
                  Pregunta {questionIndex + 1} de {questions.length}: grabando tu respuesta.
                </p>
                {questions[questionIndex] && interviewQuestionLabel(questions[questionIndex]) && (
                  <p className="text-gray-600 italic">&quot;{interviewQuestionLabel(questions[questionIndex])}&quot;</p>
                )}
                <button
                  type="button"
                  onClick={stopRecordingAndSend}
                  className="rounded-xl bg-red-600 text-white font-semibold py-4 px-6 hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2"
                  aria-label="Dejar de grabar y enviar"
                >
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white animate-pulse" aria-hidden />
                  Grabando
                </button>
              </div>
            )}

            {status === "sending" && (
              <div className="flex flex-col items-center gap-6">
                <BeatLoader color="rgba(214, 169, 54, 0.6)" speedMultiplier={0.5} />
                <p className="text-gray-600">Enviando respuesta…</p>
              </div>
            )}

            {status === "officer" && (
              <div className="flex flex-col items-center gap-6">
                <VoiceBars isPlaying={isPlayingAudio} className="flex-shrink-0" />
                <p className="text-gray-600">Respuesta del oficial…</p>
              </div>
            )}

            {status === "review" && reviewItems.length > 0 && (
              <div className="space-y-8 w-full">
                <h2 className="text-xl font-bold text-gray-800">Interview summary</h2>
                <ul className="space-y-4 w-full">
                  {reviewItems.map((item, i) => (
                    <li key={i} className="rounded-xl border-2 border-slate-200 bg-white p-4 w-full">
                      <p className="text-sm text-gray-600 mb-2">Your answer: {item.userAnswer || "(no speech)"}</p>
                      <p className="text-sm text-gray-700">Correct answer: {correctAnswerFromSuggestion(item.suggestionEn)}</p>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setStatus("idle"); setSessionId(null); setQuestions([]); setQuestionIndex(0); setReviewItems([]); }}
                    className="rounded-xl bg-amber-500 text-white font-semibold py-3 px-6 hover:bg-amber-600 transition-colors"
                  >
                    Hacer otra entrevista
                  </button>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-red-800">
                <p className="font-medium">{error}</p>
                <p className="text-sm text-red-700 mt-1">Try again in a moment.</p>
                <button
                  type="button"
                  onClick={() => { setStatus("idle"); setError(null); }}
                  className="mt-3 rounded-lg bg-red-100 text-red-800 px-4 py-2 font-medium hover:bg-red-200"
                >
                  Reintentar / Retry
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
