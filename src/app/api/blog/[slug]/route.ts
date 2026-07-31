import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const db = await getMongoDb();
    const item = await db.collection("blogs").findOne({ slug: params.slug, isActive: true });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}