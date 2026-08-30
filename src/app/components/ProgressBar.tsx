import React from "react";

type Props = {
  progressPercentage: number;
};

function ProgressBar({ progressPercentage }: Props) {
  return (
    <div
      className="mb-4 h-2 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: "var(--accent-ink-soft)" }}
    >
      <div
        className="h-2 rounded-full transition-[width] duration-300"
        style={{
          width: `${progressPercentage}%`,
          backgroundColor: "var(--surface-coral)",
        }}
      />
    </div>
  );
}

export default ProgressBar;
