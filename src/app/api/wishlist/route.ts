import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getUserWishlist, addToWishlist, removeFromWishlist } from "@/lib/models/Wishlist";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const products = await getUserWishlist(auth.userId);
    return NextResponse.json({ success: true, wishlist: products });
  } catch (err) {
    console.error("Wishlist GET error:", err);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }
    await addToWishlist(auth.userId, productId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Wishlist POST error:", err);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }
    await removeFromWishlist(auth.userId, productId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Wishlist DELETE error:", err);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
