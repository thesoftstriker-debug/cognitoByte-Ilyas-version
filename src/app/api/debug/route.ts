import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { getMongoDb } = await import("@/lib/mongodb");
    const db = await getMongoDb();
    const collections = await db.listCollections().toArray();
    return NextResponse.json({
      status: "connected",
      collections: collections.map((c: any) => c.name),
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
