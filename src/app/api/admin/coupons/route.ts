import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { findAllCoupons, createCoupon } from "@/lib/models/Coupon";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const coupons = await findAllCoupons();
    return NextResponse.json({ success: true, coupons });
  } catch (err) {
    console.error("Admin coupons GET error:", err);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await request.json();
    const { code, discountType, discountValue, minOrderAmount, isActive, expiresAt } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: "Code, discount type, and discount value are required" }, { status: 400 });
    }

    const result = await createCoupon({
      code,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
      isActive: isActive ?? true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("Admin coupon POST error:", err);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
