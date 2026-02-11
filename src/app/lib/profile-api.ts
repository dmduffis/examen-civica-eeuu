import { getAuthApiUrl } from "./auth-api";
import { getStoredToken } from "./auth-api";
import type { Profile, QuizHistoryEntry } from "./auth-types";

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const base = getAuthApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Not authenticated");
  const url = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  return res;
}

export async function fetchProfile(): Promise<Profile | null> {
  try {
    const res = await authFetch("/api/profile");
    if (res.status === 401) return null;
    if (!res.ok) return null;
    return (await res.json()) as Profile;
  } catch {
    return null;
  }
}

export async function updateProfileState(stateCode: string | null): Promise<void> {
  const res = await authFetch("/api/profile", {
    method: "PATCH",
    body: JSON.stringify({ stateCode }),
  });
  if (!res.ok) throw new Error("Error al actualizar perfil");
}

export async function fetchQuizHistory(): Promise<QuizHistoryEntry[]> {
  const profile = await fetchProfile();
  return profile?.quizHistory ?? [];
}

export async function addQuizResult(
  correct: number,
  incorrect: number,
  total: number,
  date?: string
): Promise<QuizHistoryEntry | null> {
  try {
    const res = await authFetch("/api/profile/quiz-history", {
      method: "POST",
      body: JSON.stringify({
        correct,
        incorrect,
        total,
        date: date ?? new Date().toISOString(),
      }),
    });
    if (!res.ok) return null;
    return (await res.json()) as QuizHistoryEntry;
  } catch {
    return null;
  }
}
