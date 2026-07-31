import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { findAllBlogs, createBlog } from "@/lib/models/Blog";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const result = await findAllBlogs(search, page, limit);
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
    const result = await createBlog({
      title: body.title,
      slug: body.slug,
      category: body.category || "",
      excerpt: body.excerpt || "",
      body: body.body || "",
      imageUrl: body.imageUrl || "",
      readTime: body.readTime || "",
      publishedAt: body.publishedAt || "",
      isActive: body.isActive ?? true,
    });
    return NextResponse.json({ message: "Blog created", id: result.insertedId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
