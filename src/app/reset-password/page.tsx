"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { resetPassword } from "../lib/auth-api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession, isAuthEnabled } = useAuth();
  const token = useMemo(() => searchParams.get("token"), [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordValid = newPassword.length >= 6;
  const match = newPassword === confirmPassword;
  const canSubmit = token && newPassword.length >= 6 && match;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const data = await resetPassword(token, newPassword);
      setSession(data.token, data.user);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthEnabled) {
    return (
      <main className="flex flex-col w-full justify-center pt-6 mt-2 sm:pt-16 sm:mt-8 pb-16 px-6">
        <div className="max-w-sm mx-auto text-center">
          <h1 className="text-2xl font-bold text-[var(--title-blue)] mb-3 page-title-in">
            Restablecer contraseña
          </h1>
          <p className="text-gray-600 mb-6">
            El servicio de cuenta no está disponible.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-xl bg-amber-500 text-white font-semibold px-4 py-2 hover:bg-amber-600 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="flex flex-col w-full justify-center pt-6 mt-2 sm:pt-16 sm:mt-8 pb-16 px-6">
        <div className="max-w-sm mx-auto w-full text-center">
          <div className="page-title-in">
            <h1 className="text-2xl font-bold text-[var(--title-blue)] mb-2">
              Enlace no válido
            </h1>
            <p className="text-gray-600 mb-6">
              Falta el enlace de restablecimiento o no es válido. Solicita uno nuevo.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/forgot-password"
              className="inline-flex justify-center rounded-xl bg-amber-500 text-white font-semibold px-4 py-2 hover:bg-amber-600 transition-colors"
            >
              Solicitar enlace
            </Link>
            <Link href="/login" className="text-sm text-amber-700 font-medium hover:underline">
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full justify-center pt-6 mt-2 sm:pt-16 sm:mt-8 pb-16 px-6">
      <div className="max-w-sm mx-auto w-full">
        <div className="page-title-in">
          <h1 className="text-2xl font-bold text-[var(--title-blue)] mb-2">
            Nueva contraseña
          </h1>
          <p className="text-gray-600 mb-6 text-sm">
            Elige una contraseña de al menos 6 caracteres.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 page-content-in opacity-0" style={{ animationDelay: "0.1s" }}>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-11 rounded-xl border-2 border-slate-200 bg-white px-3 text-[var(--title-blue)] shadow-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-11 rounded-xl border-2 border-slate-200 bg-white px-3 text-[var(--title-blue)] shadow-sm"
            />
            {confirmPassword.length > 0 && !match && (
              <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden</p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="rounded border-slate-300"
            />
            Mostrar contraseña
          </label>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg py-2 px-3">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="h-11 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Guardando…" : "Guardar contraseña"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/forgot-password" className="text-sm text-amber-700 font-medium hover:underline">
            ¿No tienes enlace? Solicita uno nuevo
          </Link>
        </div>
      </div>
    </main>
  );
}
