import { NextRequest, NextResponse } from "next/server";

const BACKEND =
  process.env.NEXT_PUBLIC_AUTH_API_URL?.trim()?.startsWith("http")
    ? process.env.NEXT_PUBLIC_AUTH_API_URL.trim()
    : process.env.NEXT_PUBLIC_AUTH_API_URL?.trim()
      ? `https://${process.env.NEXT_PUBLIC_AUTH_API_URL.trim()}`
      : undefined;

export async function POST(request: NextRequest) {
  if (!BACKEND) {
    return NextResponse.json({ message: "Backend not configured" }, { status: 503 });
  }
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND}/api/voice/stt`, {
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
