import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteCoupon } from "@/lib/models/Coupon";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    await deleteCoupon(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin coupon DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
