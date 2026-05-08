"use client";

import React, { useEffect, useRef, useState } from "react";

/** Classic linear waveform — bars only, no tray behind them. */
const BAR_COUNT = 36;
const MIN_BAR_HEIGHT = 4;
const MAX_BAR_HEIGHT = 44;

function resolveActiveStream(
  stream: MediaStream | null | undefined,
  mediaRecorder: MediaRecorder | null | undefined,
): MediaStream | null {
  if (stream?.active) return stream;
  if (mediaRecorder?.stream?.active) return mediaRecorder.stream;
  return null;
}

type VoiceBarsProps = {
  /** Live mic capture — uses recorder stream for frequency levels. */
  mediaRecorder?: MediaRecorder | null;
  /** Optional separate active stream (e.g. playback). */
  stream?: MediaStream | null;
  /** Idle “playing” shimmer when no stream/recorder is hooked up. */
  isPlaying?: boolean;
  className?: string;
};

export function VoiceBars({
  mediaRecorder,
  stream,
  isPlaying = false,
  className = "",
}: VoiceBarsProps) {
  const [levels, setLevels] = useState<number[]>(() =>
    Array(BAR_COUNT).fill(0),
  );
  const analyserRef = useRef<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const activeStream = resolveActiveStream(stream, mediaRecorder);

  useEffect(() => {
    if (!activeStream) {
      setLevels(Array(BAR_COUNT).fill(0));
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (contextRef.current?.state !== "closed") contextRef.current?.close();
      analyserRef.current = null;
      contextRef.current = null;
      dataArrayRef.current = null;
      return;
    }

    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(activeStream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.55;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;
    analyserRef.current = analyser;
    contextRef.current = ctx;

    const bucketSize = Math.max(1, Math.floor(bufferLength / BAR_COUNT));

    const tick = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const next: number[] = [];
      for (let i = 0; i < BAR_COUNT; i++) {
        const start = Math.min(i * bucketSize, bufferLength - bucketSize);
        let sum = 0;
        for (let j = 0; j < bucketSize; j++)
          sum += dataArrayRef.current[start + j] ?? 0;
        const avg = sum / bucketSize;
        next.push(Math.min(1, avg / 140));
      }
      setLevels(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      try {
        ctx.close();
      } catch (_) {}
      analyserRef.current = null;
      contextRef.current = null;
      dataArrayRef.current = null;
    };
  }, [activeStream]);

  const showLiveLevels = !!activeStream;
  const showPlayingWave = isPlaying && !activeStream;

  const idlePulse =
    MIN_BAR_HEIGHT + (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) * 0.18;

  return (
    <div
      className={`flex w-full max-w-[300px] items-center justify-center gap-[3px] ${className}`}
      aria-hidden
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        let heightPx: number;
        let waveStyle: React.CSSProperties | undefined;

        if (showLiveLevels) {
          heightPx =
            MIN_BAR_HEIGHT +
            (levels[i] ?? 0) * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);
        } else if (showPlayingWave) {
          heightPx = MAX_BAR_HEIGHT;
          waveStyle = {
            transformOrigin: "center center",
            animation: "voice-bar-wave 0.9s ease-in-out infinite",
            animationDelay: `${i * 0.035}s`,
          };
        } else {
          heightPx = idlePulse;
        }

        return (
          <div
            key={i}
            className="w-[3px] shrink-0 rounded-full bg-[var(--accent-orange)] transition-[height] duration-75 ease-out"
            style={{
              height: `${heightPx}px`,
              ...waveStyle,
            }}
          />
        );
      })}
    </div>
  );
}
