"use client";

import React from "react";
import type { QuizHistoryEntry } from "../lib/auth-types";

const MARGIN = { top: 16, right: 16, bottom: 32, left: 36 };
const TICK_COUNT_X = 5;
const TICK_COUNT_Y = 5;

function formatAxisDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

type ScoreChartProps = {
  entries: QuizHistoryEntry[];
  width?: number;
  height?: number;
};

const LAST_DAYS = 7;

export function ScoreChart({
  entries,
  width = 320,
  height = 200,
}: ScoreChartProps) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - LAST_DAYS);
  const last7 = entries.filter((e) => new Date(e.date) >= cutoff);
  const sorted = [...last7].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  if (sorted.length === 0) return null;

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const minScore = 0;
  const maxScore = 100;
  const xScale = (i: number) =>
    MARGIN.left + (i / Math.max(1, sorted.length - 1)) * innerWidth;
  const yScale = (p: number) =>
    MARGIN.top + innerHeight - (p / (maxScore - minScore)) * innerHeight;

  const pathD = sorted
    .map((e, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(e.scorePercent)}`)
    .join(" ");

  const xTicks = sorted.length <= TICK_COUNT_X
    ? sorted.map((_, i) => i)
    : Array.from({ length: TICK_COUNT_X }, (_, i) =>
        Math.round((i / (TICK_COUNT_X - 1)) * (sorted.length - 1))
      );
  const yTicks = Array.from(
    { length: TICK_COUNT_Y + 1 },
    (_, i) => minScore + (i / TICK_COUNT_Y) * (maxScore - minScore)
  );

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[var(--title-blue)] mb-3">
        Puntuación (últimos 7 días)
      </h2>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        aria-label="Gráfico de puntuación por fecha"
      >
        {/* Y grid */}
        {yTicks.slice(1, -1).map((v, i) => (
          <line
            key={i}
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={yScale(v)}
            y2={yScale(v)}
            stroke="rgb(226 232 240)"
            strokeDasharray="4 2"
            strokeWidth={1}
          />
        ))}
        {/* X grid */}
        {xTicks.slice(1, -1).map((i) => (
          <line
            key={i}
            x1={xScale(i)}
            x2={xScale(i)}
            y1={MARGIN.top}
            y2={height - MARGIN.bottom}
            stroke="rgb(226 232 240)"
            strokeDasharray="4 2"
            strokeWidth={1}
          />
        ))}
        {/* Y axis labels */}
        {yTicks.map((v, i) => (
          <text
            key={i}
            x={MARGIN.left - 8}
            y={yScale(v)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-gray-500 text-[10px]"
          >
            {v}%
          </text>
        ))}
        {/* X axis labels */}
        {xTicks.map((i) => (
          <text
            key={i}
            x={xScale(i)}
            y={height - MARGIN.bottom + 20}
            textAnchor="middle"
            className="fill-gray-500 text-[10px]"
          >
            {formatAxisDate(sorted[i].date)}
          </text>
        ))}
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="rgb(234 179 8)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Points */}
        {sorted.map((e, i) => (
          <circle
            key={e.id}
            cx={xScale(i)}
            cy={yScale(e.scorePercent)}
            r={4}
            fill="rgb(234 179 8)"
            stroke="white"
            strokeWidth={2}
          />
        ))}
      </svg>
    </div>
  );
}
