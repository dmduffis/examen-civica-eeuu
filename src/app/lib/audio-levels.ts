"use client";

import Meyda, { type MeydaAnalyzer } from "meyda";

export const VOICE_BAR_COUNT = 11;

/** Map Meyda amplitude spectrum (+ RMS) into 0–1 bar levels biased to speech bands. */
export function spectrumToBarLevels(
  spectrum: Float32Array | number[] | undefined,
  rms: number | undefined,
  barCount = VOICE_BAR_COUNT,
): number[] {
  const levels = Array.from({ length: barCount }, () => 0);
  if (!spectrum?.length) {
    const energy = Math.min(1, (rms ?? 0) * 4);
    return levels.map((_, i) => {
      const taper = 1 - Math.abs(i - (barCount - 1) / 2) / barCount;
      return energy * (0.35 + taper * 0.65);
    });
  }

  // Speech energy is mostly lower/mid bins; ignore very high freqs.
  const usable = Math.max(barCount, Math.floor(spectrum.length * 0.4));
  const bucket = Math.max(1, Math.floor(usable / barCount));
  const voiceRms = Math.min(1, (rms ?? 0) * 3.2);

  for (let i = 0; i < barCount; i++) {
    let peak = 0;
    const start = i * bucket;
    for (let j = 0; j < bucket; j++) {
      const v = Math.abs(spectrum[start + j] ?? 0);
      if (v > peak) peak = v;
    }
    // amplitudeSpectrum magnitudes vary; combine peak + overall loudness.
    const band = Math.min(1, peak / 55);
    levels[i] = Math.min(1, band * 0.75 + voiceRms * 0.55);
  }
  return levels;
}

type AttachMeydaArgs = {
  audioContext: AudioContext;
  source: AudioNode;
  onLevels: (levels: number[]) => void;
  barCount?: number;
};

/** Start a Meyda analyzer that reports bar levels each audio frame. */
export function attachMeydaLevels({
  audioContext,
  source,
  onLevels,
  barCount = VOICE_BAR_COUNT,
}: AttachMeydaArgs): MeydaAnalyzer | null {
  if (typeof window === "undefined") return null;
  try {
    const analyzer = Meyda.createMeydaAnalyzer({
      audioContext,
      source,
      // 512 = good speech responsiveness without too much lag
      bufferSize: 512,
      featureExtractors: ["amplitudeSpectrum", "rms"],
      callback: (features) => {
        const spectrum = features.amplitudeSpectrum as
          | Float32Array
          | number[]
          | undefined;
        const rms =
          typeof features.rms === "number" ? features.rms : undefined;
        onLevels(spectrumToBarLevels(spectrum, rms, barCount));
      },
    });
    analyzer.start();
    return analyzer;
  } catch (err) {
    console.warn("Meyda analyzer failed to start", err);
    return null;
  }
}
