import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { findAllProjects, createProject } from "@/lib/models/Project";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const result = await findAllProjects(search, page, limit);
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
    const result = await createProject({
      title: body.title,
      slug: body.slug,
      category: body.category || "",
      client: body.client || "",
      shortDescription: body.shortDescription || "",
      description: body.description || "",
      imageUrl: body.imageUrl || "",
      videoUrl: body.videoUrl || "",
      results: body.results || [],
      challenges: body.challenges || "",
      solution: body.solution || "",
      tags: body.tags || [],
      publishedAt: body.publishedAt || "",
      isActive: body.isActive ?? true,
    });
    return NextResponse.json({ message: "Project created", id: result.insertedId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
