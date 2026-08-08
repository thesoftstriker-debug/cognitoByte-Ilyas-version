import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { findProductBySlug } from "@/lib/models/Product";
import { findUserById } from "@/lib/models/User";
import { getReviewsByProduct, createReview, getAverageRating } from "@/lib/models/Review";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await findProductBySlug(params.slug);
    if (!product || !product._id) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const productId = product._id.toString();
    const reviews = await getReviewsByProduct(productId);
    const summary = await getAverageRating(productId);
    return NextResponse.json({ success: true, reviews, rating: summary.rating, count: summary.count });
  } catch (err) {
    console.error("Reviews GET error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const product = await findProductBySlug(params.slug);
    if (!product || !product._id) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const { rating, comment } = await request.json();
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: "Review comment is required" }, { status: 400 });
    }

    const user = await findUserById(auth.userId);
    const userName = user?.name || user?.email?.split("@")[0] || "Customer";

    await createReview({
      productId: product._id.toString(),
      userId: auth.userId,
      userName,
      rating: numRating,
      comment: comment.trim(),
    });

    const summary = await getAverageRating(product._id.toString());
    return NextResponse.json({ success: true, rating: summary.rating, count: summary.count });
  } catch (err) {
    console.error("Review POST error:", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
