"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./avatar";
import { cn } from "../../lib/utils";

type UserDropdownProps = {
  email: string;
  onLogout: () => void;
  className?: string;
  /** Light avatar ring on dark nav bar */
  triggerOnDark?: boolean;
};

export function UserDropdown({
  email,
  onLogout,
  className,
  triggerOnDark = false,
}: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onEscape);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "rounded-full outline-none focus:ring-2 focus:ring-offset-2",
          triggerOnDark
            ? "ring-royal-glow focus:ring-offset-[var(--surface-ink)]"
            : "ring-royal-glow focus:ring-offset-white",
        )}
        aria-label="Abrir menú de cuenta"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar
          className={cn(
            "h-9 w-9 border-2",
            triggerOnDark ? "border-white/25" : "border-[var(--border-paper)]",
          )}
        >
          <AvatarFallback className="bg-coral-soft text-ink text-sm font-semibold">
            {email.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-md border border-[var(--border-paper)] bg-white p-1 text-ink shadow-lg"
          role="menu"
        >
          <div className="px-2 py-1.5 text-sm text-brand-muted truncate">
            {email}
          </div>
          <div className="my-1 h-px bg-[var(--border-paper)]" />
          <Link
            href="/progress"
            onClick={() => setOpen(false)}
            className="block rounded-sm px-2 py-1.5 text-sm text-ink hover:bg-coral-soft hover:text-ink-deep"
            role="menuitem"
          >
            Mi progreso
          </Link>
          <div className="my-1 h-px bg-[var(--border-paper)]" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-ink hover:bg-coral-soft hover:text-coral"
            role="menuitem"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
