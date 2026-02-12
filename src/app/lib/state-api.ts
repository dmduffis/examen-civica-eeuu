import { backendUrl } from "./backend-url";

export type StateOption = { stateCode: string; name: string };

export type StateDetails = {
  stateCode: string;
  name: string;
  senators: string[];
  governor: string | null;
  capital: string | null;
};

export const STATE_STORAGE_KEY = "civic-exam-state";

export async function fetchStates(): Promise<StateOption[]> {
  const res = await fetch(backendUrl("/api/state"), {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch states");
  return res.json();
}

export async function fetchStateDetails(stateCode: string): Promise<StateDetails> {
  const res = await fetch(backendUrl(`/api/state/${encodeURIComponent(stateCode)}`), {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch state details");
  return res.json();
}

export function getStoredStateCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STATE_STORAGE_KEY);
}

export function setStoredStateCode(stateCode: string | null): void {
  if (typeof window === "undefined") return;
  if (stateCode == null) localStorage.removeItem(STATE_STORAGE_KEY);
  else localStorage.setItem(STATE_STORAGE_KEY, stateCode);
}
