"use client";

import React, { useEffect, useRef, useState } from "react";

const BAR_COUNT = 5;
const MIN_BAR_HEIGHT = 8;
const MAX_BAR_HEIGHT = 48;

type VoiceBarsProps = {
  /** When set, bars react to this stream's volume (e.g. user mic). */
  stream?: MediaStream | null;
  /** When true and no stream, show a gentle "playing" wave animation. */
  isPlaying?: boolean;
  /** CSS class for the container. */
  className?: string;
};

export function VoiceBars({
  stream,
  isPlaying = false,
  className = "",
}: VoiceBarsProps) {
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(0));
  const analyserRef = useRef<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!stream?.active) {
      setLevels(Array(BAR_COUNT).fill(0));
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (contextRef.current?.state !== "closed") contextRef.current?.close();
      analyserRef.current = null;
      contextRef.current = null;
      dataArrayRef.current = null;
      return;
    }

    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;
    analyserRef.current = analyser;
    contextRef.current = ctx;

    const bucketSize = Math.floor(bufferLength / BAR_COUNT);

    const tick = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const next: number[] = [];
      for (let i = 0; i < BAR_COUNT; i++) {
        const start = i * bucketSize;
        let sum = 0;
        for (let j = 0; j < bucketSize; j++) sum += dataArrayRef.current[start + j];
        const avg = sum / bucketSize;
        next.push(Math.min(1, avg / 128));
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
  }, [stream]);

  const showLiveLevels = !!stream?.active;
  const showPlayingWave = isPlaying && !stream?.active;
  const containerRef = useRef<HTMLDivElement>(null);

  // Force reflow on next frame when switching to wave so the CSS animation starts (avoids "stuck" on first paint).
  useEffect(() => {
    if (!showPlayingWave) return;
    const id = requestAnimationFrame(() => {
      containerRef.current && void containerRef.current.offsetHeight;
    });
    return () => cancelAnimationFrame(id);
  }, [showPlayingWave]);

  return (
    <div
      ref={containerRef}
      className={`flex items-end justify-center gap-1.5 h-12 ${className}`}
      aria-hidden
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const height = showLiveLevels
          ? MIN_BAR_HEIGHT + levels[i] * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT)
          : MAX_BAR_HEIGHT * 0.35;
        return (
          <div
            key={i}
            className="w-2 rounded-t bg-amber-500 transition-all duration-75 ease-out origin-bottom"
            style={{
              height: showLiveLevels ? height : MAX_BAR_HEIGHT * 0.4,
              minHeight: MIN_BAR_HEIGHT,
              ...(showPlayingWave
                ? {
                    animation: "voice-bar-wave 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.1}s`,
                  }
                : {}),
            }}
          />
        );
      })}
    </div>
  );
}
