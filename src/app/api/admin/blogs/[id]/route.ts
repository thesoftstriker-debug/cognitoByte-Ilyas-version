import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { findBlogById, updateBlog, deleteBlogById } from "@/lib/models/Blog";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const blog = await findBlogById(params.id);
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }
  return NextResponse.json(blog);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    await updateBlog(params.id, body);
    return NextResponse.json({ message: "Blog updated" });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  await deleteBlogById(params.id);
  return NextResponse.json({ message: "Blog deleted" });
}
