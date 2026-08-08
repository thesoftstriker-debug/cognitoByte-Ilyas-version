import { NextRequest, NextResponse } from "next/server";
import { findCouponByCode } from "@/lib/models/Coupon";

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
    }

    const coupon = await findCouponByCode(code);
    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 404 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Coupon code has expired" }, { status: 400 });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (coupon.minOrderAmount && orderSubtotal < coupon.minOrderAmount) {
      return NextResponse.json({
        error: `Minimum order amount for this coupon is $${coupon.minOrderAmount.toFixed(2)}`,
      }, { status: 400 });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (orderSubtotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, orderSubtotal);

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Number(discount.toFixed(2)),
    });
  } catch (err) {
    console.error("Coupon validation error:", err);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
