import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getUserCart, saveUserCart, type StoredCartItem } from "@/lib/models/User";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const items = await getUserCart(auth.userId);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? (body.items as StoredCartItem[]) : [];
    await saveUserCart(auth.userId, items);
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
  }
}
