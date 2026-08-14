import { NextRequest, NextResponse } from "next/server";
import { trackVisit } from "@/lib/models/Visit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const path = typeof body.path === "string" ? body.path : "/";

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : request.headers.get("x-real-ip") || "unknown";

    await trackVisit({
      path,
      ip,
      userAgent: request.headers.get("user-agent") || "",
      referrer: request.headers.get("referer") || "",
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}