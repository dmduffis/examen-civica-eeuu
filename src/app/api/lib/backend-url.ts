/**
 * Normalized backend base URL (no trailing slash).
 * Use for proxying: `${getBackendBaseUrl()}/api/...`
 */
export function getBackendBaseUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_AUTH_API_URL?.trim();
  if (!raw) return undefined;
  const base = raw.startsWith("http") ? raw : `https://${raw}`;
  return base.replace(/\/+$/, "");
}
