import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "../../../lib/backend-url";

export async function POST(request: NextRequest) {
  const BACKEND = getBackendBaseUrl();
  if (!BACKEND) {
    return NextResponse.json({ message: "Backend not configured" }, { status: 503 });
  }
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND}/api/voice/interview/respond`, {
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
    return NextResponse.json({ message: "Network error" }, { status: 502 });
  }
}
