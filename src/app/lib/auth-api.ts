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

/** POST /api/auth/forgot-password. 200 = same generic message; 400/500 throw with message. */
export async function forgotPassword(email: string): Promise<void> {
  const base = getBackendBaseUrl();
  if (!base) throw new Error("El servicio de recuperación no está disponible.");
  const res = await fetch(backendUrl("/api/auth/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok) return;
  const msg = (data.message as string) || "";
  if (res.status === 400) throw new Error(msg || "Correo no válido.");
  if (res.status === 500) throw new Error("Algo salió mal. Inténtalo más tarde.");
  throw new Error(msg || "Algo salió mal. Inténtalo más tarde.");
}

/** POST /api/auth/reset-password. Returns { user, token } on 200. */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<AuthResponse> {
  const base = getBackendBaseUrl();
  if (!base) throw new Error("El servicio no está disponible.");
  const res = await fetch(backendUrl("/api/auth/reset-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok) return data as AuthResponse;
  const msg = (data.message as string) || "";
  if (res.status === 400 && /invalid|expired|reset link/i.test(msg))
    throw new Error("Invalid or expired reset link. Request a new one.");
  if (res.status === 400) throw new Error(msg || "Datos no válidos.");
  throw new Error("Algo salió mal. Inténtalo más tarde.");
}
