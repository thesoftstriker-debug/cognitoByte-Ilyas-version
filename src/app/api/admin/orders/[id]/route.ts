import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateOrderDetails, type OrderStatus, type OrderItemDoc } from "@/lib/models/Order";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const { status, items } = (await request.json()) as {
      status: OrderStatus;
      items?: OrderItemDoc[];
    };
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }
    await updateOrderDetails(params.id, status, items);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin order update error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}