import { NextRequest, NextResponse } from "next/server";
import { trackVisit } from "@/lib/models/Visit";

export const dynamic = "force-dynamic";

const BOT_PATTERN =
  /bot|crawl|spider|slurp|headless|bingpreview|facebookexternalhit|yandex|baiduspider|ahrefs|semrush/i;

export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    if (BOT_PATTERN.test(userAgent)) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json().catch(() => ({}));
    const path = typeof body.path === "string" ? body.path : "/";
    if (path.startsWith("/admin")) {
      return NextResponse.json({ ok: true });
    }

    await trackVisit();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
