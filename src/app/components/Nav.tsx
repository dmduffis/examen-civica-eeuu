"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../lib/auth-context";
import { UserDropdown } from "./ui/user-dropdown";
import { Avatar, AvatarFallback } from "./ui/avatar";
import ProDiamond from "./ProDiamond";

export default function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const { user, isAuthEnabled, logout } = useAuth();

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

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

  const linkClass = "nav-link";
  const drawerLinkClass =
    "block py-3 text-base font-medium text-ink hover:text-ink-deep transition-colors";

  return (
    <nav className="nav-bar">
      <div className="max-w-[1067px] mx-auto px-6 sm:px-8 pt-5 pb-6 sm:pt-6 sm:pb-7 flex items-center justify-between">
        <Link href="/" className="nav-logo inline-flex items-center gap-2">
          <Image
            src="/logo_dome.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 object-contain"
            aria-hidden
            priority
          />
          Examen Civica
        </Link>

        {/* Desktop: full nav */}
        <div className="hidden sm:flex items-center gap-6 sm:gap-8">
          <Link href="/preguntas" className={linkClass}>
            Preguntas
          </Link>
          <Link href="/repasar" className={linkClass}>
            Repasar
          </Link>
          <Link href="/quiz" className={linkClass}>
            Quiz
          </Link>
          <Link
            href="/entrevista"
            className={`${linkClass} inline-flex items-center gap-1.5`}
          >
            Entrevista
            <ProDiamond />
          </Link>
          <span
            className="h-5 w-px shrink-0 self-center bg-white/20"
            aria-hidden
          />
          {isAuthEnabled && user ? (
            <UserDropdown email={user.email} onLogout={logout} triggerOnDark />
          ) : null}
          {(!isAuthEnabled || !user) && (
            <div className="inline-flex items-center gap-3">
              <Link
                href="/login"
                className={linkClass}
                aria-label="Iniciar sesión"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="btn-brand text-sm px-4 py-2"
                aria-label="Registrarse"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: avatar (when signed in) + hamburger */}
        <div className="sm:hidden flex items-center gap-2">
          {isAuthEnabled && user ? (
            <Avatar
              className="h-9 w-9 border-2 border-white/25 shrink-0"
              aria-hidden
            >
              <AvatarFallback className="bg-coral-soft text-ink text-sm font-semibold">
                {user.email.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : null}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center justify-center w-10 h-10 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={24} aria-hidden />
          </button>
        </div>
      </div>

      {/* Portal keeps the drawer above page stacking (raised buttons, etc.) */}
      {portalReady &&
        drawerOpen &&
        createPortal(
          <div
            className="mobile-nav-drawer sm:hidden fixed inset-0 z-[200]"
            aria-modal="true"
            role="dialog"
            aria-label="Menú de navegación"
          >
            <button
              type="button"
              onClick={closeDrawer}
              className="absolute inset-0 bg-black/50"
              aria-label="Cerrar menú"
            />
            <div className="absolute right-0 top-0 bottom-0 z-10 flex w-[min(100%,280px)] flex-col border-l border-[var(--border-paper)] bg-white pt-6 px-4 pb-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-brand-muted">
                  Menú
                </span>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="inline-flex items-center justify-center w-10 h-10 text-ink hover:text-ink-deep rounded-lg hover:bg-coral-soft transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X size={24} aria-hidden />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <Link
                  href="/preguntas"
                  className={drawerLinkClass}
                  onClick={closeDrawer}
                >
                  Preguntas
                </Link>
                <Link
                  href="/repasar"
                  className={drawerLinkClass}
                  onClick={closeDrawer}
                >
                  Repasar
                </Link>
                <Link
                  href="/quiz"
                  className={drawerLinkClass}
                  onClick={closeDrawer}
                >
                  Quiz
                </Link>
                <Link
                  href="/entrevista"
                  className={`${drawerLinkClass} inline-flex items-center gap-1.5`}
                  onClick={closeDrawer}
                >
                  Entrevista
                  <ProDiamond />
                </Link>
              </div>
              <span
                className="h-px bg-[var(--border-paper)] my-4"
                aria-hidden
              />
              {isAuthEnabled && user ? (
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center gap-3 px-1">
                    <Avatar className="h-9 w-9 border-2 border-[var(--border-paper)] shrink-0">
                      <AvatarFallback className="bg-coral-soft text-ink text-sm font-semibold">
                        {user.email.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-brand-muted truncate">
                      {user.email}
                    </span>
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
                    onClick={() => {
                      logout();
                      closeDrawer();
                    }}
                    className="text-left py-3 text-base font-medium text-ink hover:text-ink-deep transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : null}
              {(!isAuthEnabled || !user) && (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={closeDrawer}
                    className="btn-tile text-sm w-full py-3 px-4 justify-center font-semibold"
                    aria-label="Iniciar sesión"
                  >
                    Login
                  </Link>
                  <Link
                    href="/login"
                    onClick={closeDrawer}
                    className="btn-brand text-sm w-full py-3 px-4"
                    aria-label="Registrarse"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </nav>
  );
}
