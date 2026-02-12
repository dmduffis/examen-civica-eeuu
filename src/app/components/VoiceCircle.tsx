"use client";

import React, { useEffect, useRef, useState } from "react";

type VoiceCircleProps = {
  /** When set, the circle reacts to this stream's volume (e.g. user mic). */
  stream?: MediaStream | null;
  /** When true and no stream, show a gentle "playing" pulse (e.g. AI speaking). */
  isPlaying?: boolean;
  /** Size of the circle in pixels. */
  size?: number;
  /** CSS class for the container. */
  className?: string;
};

export function VoiceCircle({
  stream,
  isPlaying = false,
  size = 160,
  className = "",
}: VoiceCircleProps) {
  const [level, setLevel] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // React to stream: run analyser and update level
  useEffect(() => {
    if (!stream?.active) {
      setLevel(0);
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
    analyser.smoothingTimeConstant = 0.7;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;
    analyserRef.current = analyser;
    contextRef.current = ctx;

    let rafId: number;

    const tick = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
      const average = sum / dataArrayRef.current.length;
      const normalized = Math.min(1, average / 128);
      setLevel(normalized);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    rafRef.current = rafId;

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

  const showWave = !!stream?.active;
  const showPulse = isPlaying && !stream?.active;

  // Ring scales: driven by mic level when recording; CSS handles pulse when playing
  const ring1 = showWave ? 1 + level * 0.35 : 1;
  const ring2 = showWave ? 1 + level * 0.5 : 1;
  const ring3 = showWave ? 1 + level * 0.2 : 1;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Outer ring – most movement (or breathing when playing) */}
      <div
        className={`absolute rounded-full border-2 border-amber-400/60 bg-amber-400/5 transition-transform duration-75 ease-out ${showPulse ? "voice-breathe" : ""}`}
        style={{
          width: size,
          height: size,
          transform: showWave ? `scale(${ring2})` : undefined,
        }}
      />
      {/* Middle ring */}
      <div
        className={`absolute rounded-full border-2 border-amber-500/50 bg-amber-500/10 transition-transform duration-100 ease-out ${showPulse ? "voice-breathe" : ""}`}
        style={{
          width: size * 0.75,
          height: size * 0.75,
          transform: showWave ? `scale(${ring1})` : undefined,
        }}
      />
      {/* Inner circle – core */}
      <div
        className={`absolute rounded-full bg-amber-500/30 border-2 border-amber-500 transition-transform duration-150 ease-out ${showPulse ? "voice-breathe" : ""}`}
        style={{
          width: size * 0.4,
          height: size * 0.4,
          transform: showWave ? `scale(${ring3})` : undefined,
        }}
      />
    </div>
  );
}
