import { NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getMongoDb();
    const blogs = await db.collection("blogs").find({ isActive: true }).sort({ publishedAt: -1 }).toArray();
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Blog fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}