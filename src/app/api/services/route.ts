import { NextRequest, NextResponse } from "next/server";
import { findAllServices } from "@/lib/models/Service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const result = await findAllServices(search, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Services fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
