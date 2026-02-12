import type { AuthResponse } from "./auth-types";
import { getBackendBaseUrl, backendUrl } from "./backend-url";

const TOKEN_KEY = "civic-auth-token";

export function getAuthApiUrl(): string | undefined {
  return getBackendBaseUrl();
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token == null) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(backendUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");
  return data as AuthResponse;
}

export async function register(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(backendUrl("/api/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.message ||
      (res.status === 401
        ? "El servidor rechazó el registro (401). Revisa la configuración del backend."
        : "Error al registrarse");
    throw new Error(msg);
  }
  return data as AuthResponse;
}
