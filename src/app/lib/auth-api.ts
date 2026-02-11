import type { AuthResponse } from "./auth-types";

const RAW_AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL;
const TOKEN_KEY = "civic-auth-token";

function normalizeAuthApiUrl(url: string | undefined): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

const AUTH_API_URL = normalizeAuthApiUrl(RAW_AUTH_API_URL);

export function getAuthApiUrl(): string | undefined {
  return AUTH_API_URL;
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
  if (!getAuthApiUrl()) throw new Error("Auth API not configured");
  const res = await fetch("/api/auth/login", {
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
  if (!getAuthApiUrl()) throw new Error("Auth API not configured");
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Error al registrarse");
  return data as AuthResponse;
}
