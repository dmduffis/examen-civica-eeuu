"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type InterviewQuestion = {
  id: string;
  questionText: string;
  questionAudio: string;
};

type ReviewItem = {
  questionText: string;
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

export default function InterviewPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "greeting" | "question" | "recording" | "sending" | "officer" | "review" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [userName, setUserName] = useState("");
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { playBase64, stop } = useAudioPlayer();

  const startInterview = useCallback(async () => {
    setError(null);
    setStatus("loading");
    try {
      const res = await fetch("/api/voice/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userName ? { userName } : {}),
      });
      const data = (await res.json()) as StartResponse & { message?: string };
      if (res.status === 503 && data.message) {
        setError(data.message === "Voice API not configured" ? "El servicio de voz no está configurado." : data.message);
        setStatus("error");
        return;
      }
      if (!res.ok) {
        setError(data.message ?? "No se pudo iniciar la entrevista.");
        setStatus("error");
        return;
      }
      setSessionId(data.sessionId);
      setQuestions(data.questions ?? []);
      setQuestionIndex(0);
      setReviewItems([]);
      setStatus("greeting");
      await playBase64(data.greetingAudio);
      if (data.questions?.length) {
        setStatus("question");
        await playBase64(data.questions[0].questionAudio);
        setStatus("recording");
      } else {
        setStatus("idle");
      }
    } catch (e) {
      setError("Error de conexión.");
      setStatus("error");
    }
  }, [userName, playBase64]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.start();
      setStatus("recording");
    } catch (e) {
      setError("No se pudo acceder al micrófono.");
      setStatus("error");
    }
  }, []);

  const stopRecordingAndSend = useCallback(async () => {
    const recorder = recorderRef.current;
    const stream = streamRef.current;
    if (!recorder || recorder.state !== "recording") return;
    stop();
    recorder.stop();
    stream?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setStatus("sending");
    try {
      await new Promise<void>((r) => setTimeout(r, 300));
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const audioBase64 = await blobToBase64(blob);
      const res = await fetch("/api/voice/interview/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionIndex,
          audio: audioBase64,
        }),
      });
      const data = (await res.json()) as RespondResponse & { message?: string };
      if (res.status === 503 && data.message) {
        setError(data.message === "Voice API not configured" ? "El servicio de voz no está configurado." : data.message);
        setStatus("error");
        return;
      }
      if (!res.ok) {
        setError(data.message ?? "Error al enviar la respuesta.");
        setStatus("error");
        return;
      }
      setStatus("officer");
      await playBase64(data.officerResponseAudio);
      if (data.isComplete && data.review?.items) {
        setReviewItems(data.review.items);
        setStatus("review");
        return;
      }
      if (data.nextQuestion && questionIndex + 1 < (questions?.length ?? 0)) {
        const nextIdx = questionIndex + 1;
        setQuestionIndex(nextIdx);
        setStatus("question");
        await playBase64(data.nextQuestion.questionAudio);
        setStatus("recording");
      } else {
        setStatus("idle");
      }
    } catch (e) {
      setError("Error al enviar la respuesta.");
      setStatus("error");
    }
  }, [sessionId, questionIndex, questions?.length, playBase64]);

  useEffect(() => {
    if (status === "recording" && sessionId != null && questions.length > 0) {
      startRecording();
    }
  }, [status, sessionId, questions.length]); // eslint-disable-line react-hooks/exhaustive-deps -- only start when entering recording

  return (
    <main className="flex flex-col w-full justify-center pt-16 mt-8 pb-16">
      <div className="w-full px-6 sm:px-8 max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-[2.5rem] font-bold text-gray-800 mb-2">
          Entrevista de práctica
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

        {(status === "loading" || status === "greeting" || status === "question") && (
          <p className="text-gray-600">
            {status === "loading" && "Conectando…"}
            {status === "greeting" && "Reproduciendo bienvenida…"}
            {status === "question" && "Reproduciendo pregunta…"}
          </p>
        )}

        {status === "recording" && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-700 font-medium">
              Pregunta {questionIndex + 1} de {questions.length}: responde en voz alta.
            </p>
            {questions[questionIndex] && (
              <p className="text-gray-600 italic">&quot;{questions[questionIndex].questionText}&quot;</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={stopRecordingAndSend}
                className="rounded-xl bg-amber-500 text-white font-semibold py-3 px-6 hover:bg-amber-600 transition-colors"
              >
                Enviar respuesta
              </button>
            </div>
          </div>
        )}

        {status === "sending" && <p className="text-gray-600">Enviando respuesta…</p>}
        {status === "officer" && <p className="text-gray-600">Respuesta del oficial…</p>}

        {status === "review" && reviewItems.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-800">Resumen de la entrevista</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">English</h3>
                <ul className="space-y-4">
                  {reviewItems.map((item, i) => (
                    <li key={i} className="rounded-xl border-2 border-slate-200 bg-white p-4">
                      <p className="font-medium text-gray-800 mb-1">{item.questionText}</p>
                      <p className="text-sm text-gray-600 mb-2">You said: {item.userAnswer || "(no speech)"}</p>
                      <p className="text-sm text-gray-700">{item.suggestionEn}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Español</h3>
                <ul className="space-y-4">
                  {reviewItems.map((item, i) => (
                    <li key={i} className="rounded-xl border-2 border-slate-200 bg-white p-4">
                      <p className="font-medium text-gray-800 mb-1">{item.questionText}</p>
                      <p className="text-sm text-gray-600 mb-2">Dijiste: {item.userAnswer || "(sin audio)"}</p>
                      <p className="text-sm text-gray-700">{item.suggestionEs}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setStatus("idle"); setSessionId(null); setQuestions([]); setQuestionIndex(0); setReviewItems([]); }}
                className="rounded-xl bg-amber-500 text-white font-semibold py-3 px-6 hover:bg-amber-600 transition-colors"
              >
                Hacer otra entrevista
              </button>
              <Link
                href="/"
                className="rounded-xl border-2 border-slate-300 text-gray-800 font-semibold py-3 px-6 hover:bg-slate-50 transition-colors inline-flex items-center"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">{error}</p>
            <button
              type="button"
              onClick={() => { setStatus("idle"); setError(null); }}
              className="mt-3 rounded-lg bg-red-100 text-red-800 px-4 py-2 font-medium hover:bg-red-200"
            >
              Reintentar
            </button>
          </div>
        )}

        <div className="mt-8">
          <Link href="/" className="text-amber-700 hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
