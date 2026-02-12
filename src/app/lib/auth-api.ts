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
  if (!res.ok) {
    const msg = data.message || "Error al iniciar sesión";
    throw new Error(
      msg === "Auth API not configured" || msg === "NEXT_PUBLIC_AUTH_API_URL must point to your auth backend, not this app." || msg?.startsWith("NEXT_PUBLIC")
        ? "El servicio de inicio de sesión no está disponible."
        : msg === "Network error"
          ? "No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo."
          : msg
    );
  }
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
        ? "No se pudo completar el registro. Inténtalo de nuevo."
        : "Error al registrarse");
    const friendly =
      msg === "Auth API not configured" || (typeof msg === "string" && msg.includes("NEXT_PUBLIC"))
        ? "El servicio de inicio de sesión no está disponible."
        : msg === "Network error"
          ? "No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo."
          : msg;
    throw new Error(friendly);
  }
  return data as AuthResponse;
}
