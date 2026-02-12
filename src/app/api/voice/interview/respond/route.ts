import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl, fetchBackend } from "../../../lib/backend-url";

function networkErrorMessage(e: unknown): string {
  if (e instanceof Error && e.name === "AbortError") {
    return "El backend no respondió a tiempo. Comprueba que el backend esté en marcha.";
  }
  return "No se pudo conectar al backend. Comprueba NEXT_PUBLIC_AUTH_API_URL y que el backend esté accesible.";
}

export async function POST(request: NextRequest) {
  const BACKEND = getBackendBaseUrl();
  if (!BACKEND) {
    return NextResponse.json({ message: "Backend not configured" }, { status: 503 });
  }
  try {
    const body = await request.json();
    const res = await fetchBackend(`${BACKEND}/api/voice/interview/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) {
      return NextResponse.json(
        { message: data.message ?? "Voice respond not found on backend (404). Session may be invalid or backend route missing." },
        { status: 404 }
      );
    }
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ message: networkErrorMessage(e) }, { status: 502 });
  }
}
