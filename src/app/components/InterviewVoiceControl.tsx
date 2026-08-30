"use client";

import React, { useEffect, useState } from "react";
import { Mic, ArrowUp, X } from "lucide-react";
import { BeatLoader } from "react-spinners";
import { VoiceBars } from "./VoiceBars";

export type InterviewVoiceMode =
  | "loading"
  | "listening"
  | "ready"
  | "recording"
  | "sending";

type InterviewVoiceControlProps = {
  mode: InterviewVoiceMode;
  onRecord?: () => void;
  onSend?: () => void;
  onClose?: () => void;
  maxSeconds?: number;
  statusLabel?: string;
  /** e.g. "1/5" shown under the circle */
  progressLabel?: string;
  /** When listening: soft shimmer until real levels arrive. */
  isPlaying?: boolean;
  /** Live 0–1 bar levels from Meyda (TTS). */
  levels?: number[] | null;
};

function formatCountdown(remainingSec: number): string {
  const s = Math.max(0, remainingSec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
}

function OrbLoader() {
  return (
    <BeatLoader
      color="rgba(255, 255, 255, 0.92)"
      size={10}
      speedMultiplier={0.7}
    />
  );
}

export default function InterviewVoiceControl({
  mode,
  onRecord,
  onSend,
  onClose,
  maxSeconds = 20,
  statusLabel,
  progressLabel,
  isPlaying = false,
  levels = null,
}: InterviewVoiceControlProps) {
  const [remaining, setRemaining] = useState(maxSeconds);

  useEffect(() => {
    if (mode !== "recording") {
      setRemaining(maxSeconds);
      return;
    }
    setRemaining(maxSeconds);
    const started = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      setRemaining(Math.max(0, maxSeconds - elapsed));
    }, 200);
    return () => clearInterval(id);
  }, [mode, maxSeconds]);

  const isLoading = mode === "loading";
  const isListening = mode === "listening";
  const isRecording = mode === "recording";
  const isReady = mode === "ready";
  const isSending = mode === "sending";
  const isInteractive = isReady || isRecording;

  const handleOrbClick = () => {
    if (isReady) onRecord?.();
    else if (isRecording) onSend?.();
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      <div
        className="relative flex w-full flex-col items-center rounded-2xl border-2 border-[var(--border-paper)] bg-white px-5 pb-5 pt-8 text-center sm:px-8 sm:pb-6 sm:pt-9"
        style={{
          boxShadow:
            "3px 4px 0 color-mix(in srgb, var(--surface-ink) 10%, transparent)",
        }}
      >
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2.5 top-2.5 z-10 flex size-8 items-center justify-center rounded-full text-brand-muted transition-colors hover:bg-coral-soft hover:text-ink"
            aria-label="Salir de la entrevista"
          >
            <X size={18} strokeWidth={2.5} aria-hidden />
          </button>
        ) : null}

        {/* Fixed-height status slot so the orb never shifts */}
        <div className="flex h-[4.25rem] w-full flex-col items-center justify-end gap-1.5 pb-1">
          {isRecording ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-soft px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--surface-coral)]">
                <span
                  className="size-1.5 rounded-full bg-[var(--surface-coral)] animate-pulse"
                  aria-hidden
                />
                Grabando
              </span>
              <p className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-ink">
                {formatCountdown(remaining)}
              </p>
            </>
          ) : statusLabel ? (
            <p className="text-sm text-brand-muted">{statusLabel}</p>
          ) : null}
        </div>

        <div className="relative mt-5 flex h-[10.5rem] w-[10.5rem] shrink-0 items-center justify-center sm:mt-6 sm:h-[11.5rem] sm:w-[11.5rem]">
          {/* Soft pulsing halos behind the shrunk recording orb */}
          <span
            aria-hidden
            className={`pointer-events-none absolute rounded-full border-0 transition-[width,height,opacity] duration-300 ease-out ${
              isRecording
                ? "size-[9.5rem] opacity-100 sm:size-[10.5rem]"
                : "size-[5.5rem] opacity-0"
            }`}
            style={{
              backgroundColor: isRecording
                ? "color-mix(in srgb, var(--surface-coral) 18%, white)"
                : "transparent",
              animation: isRecording
                ? "interview-halo-pulse 2.8s ease-in-out infinite"
                : undefined,
            }}
          />
          <span
            aria-hidden
            className={`pointer-events-none absolute rounded-full border-0 transition-[width,height,opacity] duration-300 ease-out ${
              isRecording
                ? "size-[7.25rem] opacity-100 sm:size-[8rem]"
                : "size-[4rem] opacity-0"
            }`}
            style={{
              backgroundColor: isRecording
                ? "color-mix(in srgb, var(--surface-coral) 38%, white)"
                : "transparent",
              animation: isRecording
                ? "interview-halo-pulse 2.8s ease-in-out infinite"
                : undefined,
              animationDelay: isRecording ? "0.35s" : undefined,
            }}
          />
          <button
            type="button"
            onClick={isInteractive ? handleOrbClick : undefined}
            disabled={!isInteractive}
            aria-busy={isLoading || isSending || undefined}
            aria-label={
              isReady
                ? "Grabar respuesta"
                : isRecording
                  ? "Enviar respuesta"
                  : isLoading
                    ? "Cargando"
                    : isSending
                      ? "Enviando"
                      : undefined
            }
            className={`relative z-[1] flex size-[9.5rem] items-center justify-center rounded-full text-white transition-[transform,background-color,box-shadow] duration-300 ease-out sm:size-[10.5rem] ${
              isRecording
                ? "interview-voice-orb-recording scale-[0.52] bg-[var(--surface-coral)]"
                : "interview-voice-orb scale-100 bg-[var(--surface-blue)]"
            } ${
              isInteractive
                ? "cursor-pointer active:brightness-95"
                : "cursor-default"
            } disabled:pointer-events-none`}
          >
            {isLoading || isSending ? (
              <OrbLoader />
            ) : isListening ? (
              <VoiceBars
                isPlaying={isPlaying}
                levels={levels}
                variant="onColor"
                className="!max-w-[7.5rem]"
              />
            ) : isReady ? (
              <Mic size={40} strokeWidth={2.25} aria-hidden />
            ) : isRecording ? (
              <ArrowUp
                size={40}
                strokeWidth={2.5}
                className="scale-[1.15]"
                aria-hidden
              />
            ) : null}
          </button>
        </div>

        <div className="flex h-10 w-full items-start justify-center pt-4">
          {progressLabel ? (
            <p className="text-sm font-medium tabular-nums text-brand-muted">
              {progressLabel}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
