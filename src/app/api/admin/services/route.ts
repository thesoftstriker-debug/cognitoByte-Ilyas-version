import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { findAllServices, createService } from "@/lib/models/Service";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const result = await findAllServices(search, page, limit);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: "Missing required fields (title, slug)" }, { status: 400 });
    }
    const result = await createService({
      title: body.title,
      slug: body.slug,
      order: body.order ?? 0,
      icon: body.icon || "Zap",
      shortDescription: body.shortDescription || "",
      description: body.description || "",
      imageUrl: body.imageUrl || "",
      features: body.features || [],
      process: body.process || [],
      isActive: body.isActive ?? true,
    });
    return NextResponse.json({ message: "Service created", id: result.insertedId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
