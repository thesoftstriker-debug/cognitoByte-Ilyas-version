import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { findPricingById, updatePricingPlan, deletePricingById } from "@/lib/models/Pricing";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const plan = await findPricingById(params.id);
  if (!plan) {
    return NextResponse.json({ error: "Pricing plan not found" }, { status: 404 });
  }
  return NextResponse.json(plan);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    await updatePricingPlan(params.id, body);
    return NextResponse.json({ message: "Pricing plan updated" });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  await deletePricingById(params.id);
  return NextResponse.json({ message: "Pricing plan deleted" });
}
