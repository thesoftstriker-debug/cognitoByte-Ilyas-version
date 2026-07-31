import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getMongoDb();
    const plans = await db
      .collection("pricing")
      .find({ isActive: true })
      .sort({ order: 1 })
      .toArray();
    return NextResponse.json(plans);
  } catch (error) {
    console.error("Pricing fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}
