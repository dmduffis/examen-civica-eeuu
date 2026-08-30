"use client";

import type { DisplayLang } from "../lib/question-types";

type LangSelectProps = {
  value: DisplayLang;
  onChange: (lang: DisplayLang) => void;
  className?: string;
};

export default function LangSelect({
  value,
  onChange,
  className = "",
}: LangSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DisplayLang)}
      className={`select-raised select-raised--lang ${className}`.trim()}
      aria-label="Idioma"
    >
      <option value="es">Español</option>
      <option value="en">English</option>
    </select>
  );
}
