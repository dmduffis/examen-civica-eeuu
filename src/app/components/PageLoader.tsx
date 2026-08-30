"use client";

import React from "react";
import { BeatLoader } from "react-spinners";

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[whitesmoke] z-[100]" aria-label="Cargando">
      <BeatLoader color="rgba(214, 169, 54, 0.8)" size={12} speedMultiplier={0.7} />
      <p className="mt-4 text-sm text-brand-muted">Cargando…</p>
    </div>
  );
}
