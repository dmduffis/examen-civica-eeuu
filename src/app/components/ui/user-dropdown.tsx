"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./avatar";
import { cn } from "../../lib/utils";

type UserDropdownProps = {
  email: string;
  onLogout: () => void;
  className?: string;
};

export function UserDropdown({ email, onLogout, className }: UserDropdownProps) {
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
        className="rounded-full outline-none ring-amber-500 focus:ring-2 focus:ring-offset-2"
        aria-label="Abrir menú de cuenta"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar className="h-9 w-9 border-2 border-slate-200">
          <AvatarFallback className="bg-amber-100 text-amber-800 text-sm font-semibold">
            {email.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-gray-800 shadow-lg"
          role="menu"
        >
          <div className="px-2 py-1.5 text-sm text-gray-500 truncate">
            {email}
          </div>
          <div className="my-1 h-px bg-slate-200" />
          <Link
            href="/progress"
            onClick={() => setOpen(false)}
            className="block rounded-sm px-2 py-1.5 text-sm text-gray-800 hover:bg-amber-50 hover:text-amber-900"
            role="menuitem"
          >
            Mi progreso
          </Link>
          <div className="my-1 h-px bg-slate-200" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700"
            role="menuitem"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
