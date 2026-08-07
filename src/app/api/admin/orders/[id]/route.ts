import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { updateOrderStatus, type OrderStatus } from "@/lib/models/Order";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const status = body?.status as OrderStatus;
    if (status !== "pending" && status !== "delivered") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const result = await updateOrderStatus(params.id, status);
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, status });
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}