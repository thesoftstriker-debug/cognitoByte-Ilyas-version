import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const db = await getMongoDb();
    const service = await db.collection("services").findOne({ slug: params.slug });
    if (!service) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
