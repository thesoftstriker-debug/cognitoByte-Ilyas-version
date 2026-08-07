import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getMongoDb } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  try {
    const db = await getMongoDb();
    const [users, services, projects, products, blogs, pricing, orders] =
      await Promise.all([
        db.collection("users").countDocuments(),
        db.collection("services").countDocuments(),
        db.collection("projects").countDocuments(),
        db.collection("products").countDocuments(),
        db.collection("blogs").countDocuments(),
        db.collection("pricing").countDocuments(),
        db.collection("orders").countDocuments(),
      ]);
    return NextResponse.json({ users, services, projects, products, blogs, pricing, orders });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
