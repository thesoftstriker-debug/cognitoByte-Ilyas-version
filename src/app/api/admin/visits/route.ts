import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getVisitStats } from "@/lib/models/Visit";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7");

  const stats = await getVisitStats(days);

  return NextResponse.json({ stats });
}
