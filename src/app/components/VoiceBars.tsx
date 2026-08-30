"use client";

import React, { useEffect, useRef, useState } from "react";
import { attachMeydaLevels, VOICE_BAR_COUNT } from "../lib/audio-levels";

/** Compact capsule waveform — levels from Meyda (TTS) or live mic stream. */
const MIN_BAR_HEIGHT = 6;
const MAX_BAR_HEIGHT = 36;
const WAVE_TRACK_HEIGHT_PX = 56;

function resolveActiveStream(
  stream: MediaStream | null | undefined,
  mediaRecorder: MediaRecorder | null | undefined,
): MediaStream | null {
  if (stream?.active) return stream;
  if (mediaRecorder?.stream?.active) return mediaRecorder.stream;
  return null;
}

type VoiceBarsProps = {
  /** Precomputed 0–1 levels (e.g. from Meyda on TTS playback). */
  levels?: number[] | null;
  /** Live mic capture — analysed with Meyda. */
  mediaRecorder?: MediaRecorder | null;
  stream?: MediaStream | null;
  /** Soft idle shimmer when playing but levels not ready yet. */
  isPlaying?: boolean;
  variant?: "tray" | "onColor";
  className?: string;
};

export function VoiceBars({
  levels: externalLevels = null,
  mediaRecorder,
  stream,
  isPlaying = false,
  variant = "tray",
  className = "",
}: VoiceBarsProps) {
  const [micLevels, setMicLevels] = useState<number[]>(() =>
    Array(VOICE_BAR_COUNT).fill(0),
  );
  const ctxRef = useRef<AudioContext | null>(null);
  const meydaRef = useRef<ReturnType<typeof attachMeydaLevels>>(null);

  const activeStream = resolveActiveStream(stream, mediaRecorder);
  const hasExternal =
    Array.isArray(externalLevels) && externalLevels.length > 0;

  useEffect(() => {
    if (hasExternal || !activeStream) {
      try {
        meydaRef.current?.stop();
      } catch {
        /* ignore */
      }
      meydaRef.current = null;
      if (ctxRef.current?.state !== "closed") {
        try {
          ctxRef.current?.close();
        } catch {
          /* ignore */
        }
      }
      ctxRef.current = null;
      setMicLevels(Array(VOICE_BAR_COUNT).fill(0));
      return;
    }

    let cancelled = false;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    void ctx.resume().then(() => {
      if (cancelled) return;
      const source = ctx.createMediaStreamSource(activeStream);
      meydaRef.current = attachMeydaLevels({
        audioContext: ctx,
        source,
        onLevels: (next) => {
          if (!cancelled) setMicLevels(next);
        },
      });
    });

    return () => {
      cancelled = true;
      try {
        meydaRef.current?.stop();
      } catch {
        /* ignore */
      }
      meydaRef.current = null;
      if (ctx.state !== "closed") {
        try {
          ctx.close();
        } catch {
          /* ignore */
        }
      }
      ctxRef.current = null;
    };
  }, [activeStream, hasExternal]);

  const liveLevels = hasExternal ? externalLevels! : micLevels;
  const hasLiveSignal = liveLevels.some((v) => v > 0.04);
  const showLive = hasExternal || !!activeStream;
  const showPlayingWave = isPlaying && !hasLiveSignal && !activeStream;

  const isOnColor = variant === "onColor";
  const barColor = isOnColor ? "rgba(255,255,255,0.92)" : "#d7dde3";
  const trackHeight = isOnColor ? 44 : WAVE_TRACK_HEIGHT_PX;
  const maxBar = isOnColor ? 32 : MAX_BAR_HEIGHT;
  const minBar = isOnColor ? 5 : MIN_BAR_HEIGHT;

  return (
    <div
      className={`inline-flex w-full max-w-[280px] shrink-0 items-center justify-center ${
        isOnColor
          ? "rounded-none bg-transparent px-2 py-0"
          : "rounded-2xl px-5 py-3"
      } ${className}`}
      style={{
        height: isOnColor ? trackHeight : WAVE_TRACK_HEIGHT_PX + 24,
        backgroundColor: isOnColor ? "transparent" : "#2f363c",
      }}
      aria-hidden
    >
      <div
        className={`flex w-full items-center justify-center ${
          isOnColor ? "gap-[4px]" : "gap-[5px]"
        }`}
        style={{ height: trackHeight }}
      >
        {Array.from({ length: VOICE_BAR_COUNT }, (_, i) => {
          let heightPx: number;
          let waveStyle: React.CSSProperties | undefined;

          if (showLive) {
            const level = liveLevels[i] ?? 0;
            const floor = 0.08;
            heightPx = minBar + Math.max(floor, level) * (maxBar - minBar);
          } else if (showPlayingWave) {
            heightPx = maxBar;
            waveStyle = {
              transformOrigin: "center center",
              animation: "voice-bar-wave 0.95s ease-in-out infinite",
              animationDelay: `${i * 0.05}s`,
            };
          } else {
            const idlePattern = [
              0.12, 0.28, 0.4, 0.78, 0.62, 0.48, 0.66, 0.52, 0.82, 0.64, 0.46,
            ];
            heightPx = minBar + (idlePattern[i] ?? 0.4) * (maxBar - minBar);
          }

          return (
            <div
              key={i}
              className={`flex h-full shrink-0 items-center justify-center ${
                isOnColor ? "w-[6px]" : "w-[7px]"
              }`}
            >
              <div
                className="w-full rounded-full transition-[height] duration-75 ease-out"
                style={{
                  height: `${heightPx}px`,
                  maxHeight: trackHeight,
                  backgroundColor: barColor,
                  ...waveStyle,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
