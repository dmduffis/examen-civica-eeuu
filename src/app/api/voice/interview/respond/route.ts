import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl, fetchBackend } from "../../../lib/backend-url";

function networkErrorMessage(e: unknown): string {
  if (e instanceof Error && e.name === "AbortError") {
    return "El servicio tardó demasiado. Inténtalo de nuevo en un momento.";
  }
  return "No se pudo conectar. Comprueba tu conexión a internet e inténtalo de nuevo.";
}

export async function POST(request: NextRequest) {
  const BACKEND = getBackendBaseUrl();
  if (!BACKEND) {
    return NextResponse.json({ message: "El servicio de voz no está disponible en este momento." }, { status: 503 });
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
        { message: "La sesión expiró o el servicio no está disponible. Inicia una nueva entrevista." },
        { status: 404 }
      );
    }
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ message: networkErrorMessage(e) }, { status: 502 });
  }
}
