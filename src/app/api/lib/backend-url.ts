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

const VOICE_TIMEOUT_MS = 60_000;

/**
 * Fetch backend with long timeout (voice can be slow). Throws on timeout or network error.
 */
export async function fetchBackend(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = VOICE_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}
