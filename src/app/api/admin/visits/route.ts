import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getVisitStats, findVisits } from "@/lib/models/Visit";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const days = parseInt(searchParams.get("days") || "7");

  const [stats, result] = await Promise.all([
    getVisitStats(days),
    findVisits({ search, page, limit }),
  ]);

  return NextResponse.json({ stats, ...result });
}