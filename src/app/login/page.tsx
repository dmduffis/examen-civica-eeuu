"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isAuthEnabled } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthEnabled) {
    return (
      <main className="flex flex-col w-full justify-center page-top pb-16 px-6">
        <div className="max-w-sm mx-auto text-center">
          <h1 className="page-heading mb-3 page-title-in">Cuenta</h1>
          <p className="text-brand-muted mb-6">
            La sincronización entre dispositivos no está disponible. Puedes usar
            la app sin cuenta; tu progreso se guardará en este dispositivo.
          </p>
          <Link
            href="/"
            className="btn-brand px-4 py-2"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full justify-center page-top pb-16 px-6">
      <div className="max-w-sm mx-auto w-full">
        <div className="page-title-in">
          <h1 className="page-heading mb-2">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h1>
          <p className="text-brand-muted mb-6 text-sm">
            {mode === "login"
              ? "Entra para ver tu progreso en todos tus dispositivos."
              : "Regístrate para guardar tu historial de quizzes y estado."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 page-content-in opacity-0"
          style={{ animationDelay: "0.1s" }}
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-ink mb-1"
            >
              Correo
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field h-11"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ink"
              >
                Contraseña
              </label>
              {mode === "login" && (
                <Link
                  href="/forgot-password"
                  className="text-sm text-coral font-medium hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              )}
            </div>
            <input
              id="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input-field h-11"
            />
            {mode === "register" && (
              <p className="text-xs text-brand-muted mt-1">
                Mínimo 6 caracteres
              </p>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg py-2 px-3">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn-brand h-11 w-full"
          >
            {submitting ? "..." : mode === "login" ? "Entrar" : "Registrarme"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-muted">
          {mode === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-coral font-medium hover:underline"
              >
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-coral font-medium hover:underline"
              >
                Inicia sesión
              </button>
            </>
          )}
        </p>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-brand-muted hover:text-ink">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
