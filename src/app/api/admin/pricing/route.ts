import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { findAllPricingPlans, createPricingPlan } from "@/lib/models/Pricing";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const result = await findAllPricingPlans(search, page, limit);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    if (!body.name || !body.price) {
      return NextResponse.json({ error: "Missing required fields (name, price)" }, { status: 400 });
    }
    const result = await createPricingPlan({
      name: body.name,
      price: body.price,
      period: body.period || "",
      description: body.description || "",
      features: body.features || [],
      isPopular: body.isPopular ?? false,
      ctaText: body.ctaText || "Get Started",
      order: body.order ?? 0,
      isActive: body.isActive ?? true,
    });
    return NextResponse.json({ message: "Pricing plan created", id: result.insertedId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
