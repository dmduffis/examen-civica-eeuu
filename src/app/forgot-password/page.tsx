"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import { forgotPassword } from "../lib/auth-api";

export default function ForgotPasswordPage() {
  const { isAuthEnabled } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo salió mal.";
      const isNetwork = /fetch|network|conexión|cors/i.test(msg) || msg === "Failed to fetch";
      setError(isNetwork ? "No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo." : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthEnabled) {
    return (
      <main className="flex flex-col w-full justify-center pt-6 mt-2 sm:pt-16 sm:mt-8 pb-16 px-6">
        <div className="max-w-sm mx-auto text-center">
          <h1 className="page-heading mb-3 page-title-in">
            Recuperar contraseña
          </h1>
          <p className="text-brand-muted mb-6">
            La sincronización entre dispositivos no está disponible.
          </p>
          <Link
            href="/login"
            className="btn-brand px-4 py-2"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="flex flex-col w-full justify-center pt-6 mt-2 sm:pt-16 sm:mt-8 pb-16 px-6">
        <div className="max-w-sm mx-auto w-full">
          <div className="page-title-in">
            <h1 className="page-heading mb-2">
              Revisa tu correo
            </h1>
            <p className="text-brand-muted mb-6">
              Si ese correo está registrado, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y la carpeta de spam.
            </p>
          </div>
          <p className="text-sm text-brand-muted mb-6">
            El enlace es válido durante 1 hora.
          </p>
          <Link
            href="/login"
            className="btn-brand px-4 py-2"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full justify-center pt-6 mt-2 sm:pt-16 sm:mt-8 pb-16 px-6">
      <div className="max-w-sm mx-auto w-full">
        <div className="page-title-in">
          <h1 className="page-heading mb-2">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-brand-muted mb-6 text-sm">
            Introduce tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 page-content-in opacity-0" style={{ animationDelay: "0.1s" }}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
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
            {submitting ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-coral font-medium hover:underline">
            ← Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
