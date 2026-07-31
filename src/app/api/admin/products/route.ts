import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  findAllProductsAdmin,
  createProduct,
} from "@/lib/models/Product";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const result = await findAllProductsAdmin(search, page, limit);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    if (!body.name || !body.slug || !body.price || !body.category) {
      return NextResponse.json({ error: "Missing required fields (name, slug, price, category)" }, { status: 400 });
    }
    const result = await createProduct({
      name: body.name,
      slug: body.slug,
      description: body.description || "",
      price: body.price,
      category: body.category,
      imageUrl: body.imageUrl || "",
      fileUrl: body.fileUrl || "",
      isActive: body.isActive ?? true,
    });
    return NextResponse.json({ message: "Product created", id: result.insertedId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
