"use client";

import React, { useEffect, useRef, useState } from "react";
import { LiveAudioVisualizer } from "react-audio-visualize";

const BAR_COUNT = 5;
const MIN_BAR_HEIGHT = 8;
const MAX_BAR_HEIGHT = 48;
const AMBER_BAR_COLOR = "rgba(214, 169, 54, 0.9)";

type VoiceBarsProps = {
  /** When set, use library wave visualizer for this recorder (e.g. user speaking). */
  mediaRecorder?: MediaRecorder | null;
  /** When set (and no mediaRecorder), bars react to this stream's volume. Fallback if mediaRecorder not used. */
  stream?: MediaStream | null;
  /** When true and no stream/recorder, show a gentle "playing" wave animation. */
  isPlaying?: boolean;
  /** CSS class for the container. */
  className?: string;
};

export function VoiceBars({
  mediaRecorder,
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

  const useLibraryVisualizer = !!mediaRecorder;
  const showLiveLevels = !useLibraryVisualizer && !!stream?.active;
  const showPlayingWave = isPlaying && !stream?.active && !useLibraryVisualizer;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPlayingWave) return;
    const id = requestAnimationFrame(() => {
      containerRef.current && void containerRef.current.offsetHeight;
    });
    return () => cancelAnimationFrame(id);
  }, [showPlayingWave]);

  if (useLibraryVisualizer) {
    return (
      <div className={`flex items-center justify-center h-12 w-full max-w-[280px] ${className}`} aria-hidden>
        <LiveAudioVisualizer
          mediaRecorder={mediaRecorder!}
          width={280}
          height={48}
          barWidth={3}
          gap={2}
          barColor={AMBER_BAR_COLOR}
          backgroundColor="transparent"
        />
      </div>
    );
  }

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
