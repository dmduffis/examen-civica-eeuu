import { NextResponse } from "next/server";

const BACKEND =
  process.env.NEXT_PUBLIC_AUTH_API_URL?.trim()?.startsWith("http")
    ? process.env.NEXT_PUBLIC_AUTH_API_URL?.trim()
    : process.env.NEXT_PUBLIC_AUTH_API_URL?.trim()
      ? `https://${process.env.NEXT_PUBLIC_AUTH_API_URL.trim()}`
      : undefined;

export async function GET() {
  if (!BACKEND) {
    return NextResponse.json({ message: "Backend not configured" }, { status: 503 });
  }
  try {
    const res = await fetch(`${BACKEND}/api/question`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { message: "Failed to load questions" },
      { status: 502 }
    );
  }
}
