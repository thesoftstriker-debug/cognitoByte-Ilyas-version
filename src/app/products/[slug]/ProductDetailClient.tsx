"use client";
import { useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";
import { ArrowLeft, ShoppingCart, Zap, Heart, Star, Send } from "lucide-react";

export interface ProductDetail {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Props {
  product: ProductDetail;
  slug: string;
  initialReviews: Review[];
  initialAvgRating: number;
  initialReviewCount: number;
}

export function ProductDetailClient({
  product,
  slug,
  initialReviews,
  initialAvgRating,
  initialReviewCount,
}: Props) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [avgRating, setAvgRating] = useState(initialAvgRating);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleAddToCart = () => {
    dispatch(
      addItem({
        productId: product._id,
        name: product.name,
        price: product.price,
        slug: product.slug,
        imageUrl: product.imageUrl,
      })
    );
    toast.success("Added to cart!");
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error("Please sign in to save items to your wishlist");
      return;
    }

    try {
      if (inWishlist) {
        await fetch(`/api/wishlist?productId=${product._id}`, { method: "DELETE" });
        setInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product._id }),
        });
        setInWishlist(true);
        toast.success("Saved to wishlist!");
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Review comment cannot be empty");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: newRating, comment: newComment }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Review submitted!");
        setNewComment("");
        setAvgRating(data.rating);
        setReviewCount(data.count);
        // Refresh reviews list
        const revRes = await fetch(`/api/products/${slug}/reviews`);
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviews(revData.reviews || []);
        }
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to products
        </Link>

        {/* Product Details Card */}
        <div className="card p-6 sm:p-8">
          {product.imageUrl && (
            <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden mb-6">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400" /> {avgRating} ({reviewCount} reviews)
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mt-3 text-gray-900">{product.name}</h1>
            </div>
            <div className="text-3xl font-bold font-mono text-brand-600">${product.price.toFixed(2)}</div>
          </div>

          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

          <div className="flex flex-wrap items-center gap-3">
            {user?.role !== "admin" && (
              <button onClick={handleAddToCart} className="btn-primary text-sm py-2.5 px-5 gap-2">
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            )}
            <button
              onClick={handleWishlistToggle}
              className={`p-2.5 rounded-xl border transition-colors flex items-center gap-2 text-sm font-medium ${
                inWishlist
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
              {inWishlist ? "Saved in Wishlist" : "Save for Later"}
            </button>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-6 pt-4 border-t border-gray-100">
            <Zap className="w-4 h-4 text-brand-500 shrink-0" /> Instant access after purchase — no waiting, delivered right to your account.
          </p>
        </div>

        {/* Customer Reviews Section */}
        <div className="card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Customer Reviews
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Rating breakdown based on verified buyers
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-lg">
                <Star className="w-5 h-5 fill-amber-400" /> {avgRating} / 5
              </div>
              <span className="text-xs text-gray-400">{reviewCount} total reviews</span>
            </div>
          </div>

          {/* Add Review Form */}
          {user ? (
            <form onSubmit={handleReviewSubmit} className="bg-gray-50/50 p-4 rounded-xl space-y-3 border border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Write a Review</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating ? "text-amber-400 fill-amber-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                required
                rows={3}
                placeholder="Share your thoughts about this digital product..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <div className="flex justify-end">
                <button type="submit" disabled={submittingReview} className="btn-primary text-xs py-2 px-4 gap-1.5">
                  <Send className="w-3.5 h-3.5" /> {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
              Please <Link href="/login" className="text-brand-600 underline font-semibold">Sign In</Link> to post a review.
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4 divide-y divide-gray-100">
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No customer reviews yet. Be the first to leave a review!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="pt-4 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">{rev.userName}</span>
                    <span className="text-[11px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? "fill-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 pt-1">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}