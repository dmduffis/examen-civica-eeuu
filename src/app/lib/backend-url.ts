/**
 * Backend base URL for all API calls (auth, profile, questions, state, voice).
 * Must be set to the backend's full base URL (e.g. https://your-backend.onrender.com).
 * Do NOT set to the frontend URL (e.g. examencivica.com) or you'll get 404/connection errors.
 */
export function getBackendBaseUrl(): string | undefined {
  if (typeof window === "undefined") {
    const raw = process.env.NEXT_PUBLIC_AUTH_API_URL?.trim();
    if (!raw) return undefined;
    const base = raw.startsWith("http") ? raw : `https://${raw}`;
    return base.replace(/\/+$/, "");
  }
  const raw = process.env.NEXT_PUBLIC_AUTH_API_URL?.trim();
  if (!raw) return undefined;
  const base = raw.startsWith("http") ? raw : `https://${raw}`;
  return base.replace(/\/+$/, "");
}

export function backendUrl(path: string): string {
  const base = getBackendBaseUrl();
  if (!base) throw new Error("Backend not configured (NEXT_PUBLIC_AUTH_API_URL)");
  return base + (path.startsWith("/") ? path : `/${path}`);
}
