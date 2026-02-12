"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { UserDropdown } from "./ui/user-dropdown";
import { Avatar, AvatarFallback } from "./ui/avatar";

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, isAuthEnabled, logout } = useAuth();

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onEscape = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const linkClass =
    "inline-flex items-center text-sm font-medium text-gray-600 hover:text-amber-700 transition-colors";
  const drawerLinkClass =
    "block py-3 text-base font-medium text-gray-700 hover:text-gray-900 transition-colors";

  return (
    <nav className="w-full border-b border-slate-300 bg-transparent">
      <div className="max-w-[1067px] mx-auto px-6 sm:px-8 pt-5 pb-6 sm:pt-6 sm:pb-7 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-lg font-bold text-amber-700 hover:text-amber-800 transition-colors"
        >
          Examen Civica
        </Link>

        {/* Desktop: full nav */}
        <div className="hidden sm:flex items-center gap-6 sm:gap-8">
          <Link href="/quiz" className={linkClass}>
            Quiz
          </Link>
          <Link href="/review" className={linkClass}>
            Preguntas
          </Link>
          <Link href="/flashcards" className={linkClass}>
            Revisar
          </Link>
          <span
            className="h-5 w-px bg-slate-200 shrink-0 self-center"
            aria-hidden
          />
          {isAuthEnabled && user ? (
            <UserDropdown email={user.email} onLogout={logout} />
          ) : null}
          {(!isAuthEnabled || !user) && (
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 text-white text-sm font-semibold px-4 py-2 hover:bg-amber-600 transition-colors"
              aria-label="Iniciar sesión / Registrarse"
            >
              <UserIcon />
              Sign up / In
            </Link>
          )}
        </div>

        {/* Mobile: avatar (when signed in) + hamburger */}
        <div className="sm:hidden flex items-center gap-2">
          {isAuthEnabled && user ? (
            <Avatar className="h-9 w-9 border-2 border-slate-200 shrink-0" aria-hidden>
              <AvatarFallback className="bg-amber-100 text-amber-800 text-sm font-semibold">
                {user.email.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : null}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="sm:hidden fixed inset-0 z-50"
          aria-modal="true"
          role="dialog"
          aria-label="Menú de navegación"
        >
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Cerrar menú"
          />
          <div className="absolute right-0 top-0 bottom-0 w-[min(100%,280px)] bg-white border-l border-slate-200 shadow-xl flex flex-col pt-6 px-4 pb-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-gray-500">Menú</span>
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Cerrar menú"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <Link
                href="/quiz"
                className={drawerLinkClass}
                onClick={closeDrawer}
              >
                Quiz
              </Link>
              <Link
                href="/review"
                className={drawerLinkClass}
                onClick={closeDrawer}
              >
                Preguntas
              </Link>
              <Link
                href="/flashcards"
                className={drawerLinkClass}
                onClick={closeDrawer}
              >
                Revisar
              </Link>
            </div>
            <span className="h-px bg-slate-200 my-4" aria-hidden />
            {isAuthEnabled && user ? (
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-3 px-1">
                  <Avatar className="h-9 w-9 border-2 border-slate-200 shrink-0">
                    <AvatarFallback className="bg-amber-100 text-amber-800 text-sm font-semibold">
                      {user.email.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600 truncate">{user.email}</span>
                </div>
                <Link
                  href="/progress"
                  className={drawerLinkClass}
                  onClick={closeDrawer}
                >
                  Mi progreso
                </Link>
                <button
                  type="button"
                  onClick={() => { logout(); closeDrawer(); }}
                  className="text-left py-3 text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : null}
            {(!isAuthEnabled || !user) && (
              <Link
                href="/login"
                onClick={closeDrawer}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 text-white text-sm font-semibold py-3 px-4 hover:bg-amber-600 transition-colors"
              >
                <UserIcon />
                Sign up / In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
