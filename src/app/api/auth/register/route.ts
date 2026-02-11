import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_AUTH_API_URL?.trim();
const BASE = BACKEND_URL?.startsWith("http") ? BACKEND_URL : BACKEND_URL ? `https://${BACKEND_URL}` : undefined;

export async function POST(request: NextRequest) {
  if (!BASE) {
    return NextResponse.json({ message: "Auth API not configured" }, { status: 503 });
  }
  const selfOrigin = request.nextUrl.origin;
  if (BASE.startsWith(selfOrigin) || BASE.replace(/^https?:\/\//, "").split("/")[0] === selfOrigin.replace(/^https?:\/\//, "").split("/")[0]) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_AUTH_API_URL must point to your auth backend, not this app. Use a different URL (e.g. your Railway auth API)." },
      { status: 503 }
    );
  }
  try {
    const body = await request.json();
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ message: "Network error" }, { status: 502 });
  }
}
