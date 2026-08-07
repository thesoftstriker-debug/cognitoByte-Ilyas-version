import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { findAllOrders } from "@/lib/models/Order";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  try {
    const result = await findAllOrders(page, limit);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ orders: [], total: 0 }, { status: 500 });
  }
}