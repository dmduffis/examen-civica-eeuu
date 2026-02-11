import { NextRequest, NextResponse } from "next/server";

const RAILWAY_BASE =
  process.env.NEXT_PUBLIC_QUESTIONS_API_URL?.trim() ||
  "https://examencivicabackend-production.up.railway.app";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  if (!code) {
    return NextResponse.json({ message: "Missing state code" }, { status: 400 });
  }
  try {
    const res = await fetch(
      `${RAILWAY_BASE}/api/state/${encodeURIComponent(code)}`,
      { headers: { "Content-Type": "application/json" } }
    );
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { message: "Failed to load state details" },
      { status: 502 }
    );
  }
}
