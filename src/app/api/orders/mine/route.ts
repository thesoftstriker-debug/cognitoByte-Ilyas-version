import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { findOrdersByUser } from "@/lib/models/Order";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const orders = await findOrdersByUser(auth.userId);
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}
