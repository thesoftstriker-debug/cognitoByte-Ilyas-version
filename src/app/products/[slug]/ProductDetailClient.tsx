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
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-[#08090f] text-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to products
        </Link>

        {/* Product Details Card */}
        <div className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {product.imageUrl && (
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-6 border border-white/10">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-300 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400" /> {avgRating} ({reviewCount} reviews)
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-3 text-white tracking-tight">{product.name}</h1>
            </div>
            <div className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-indigo-300">
              ${product.price.toFixed(2)}
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed mb-8">{product.description}</p>

          <div className="flex flex-wrap items-center gap-3">
            {user?.role !== "admin" && (
              <button onClick={handleAddToCart} className="btn-primary text-sm py-2.5 px-6 gap-2">
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            )}
            <button
              onClick={handleWishlistToggle}
              className={`p-2.5 px-4 rounded-xl border transition-all flex items-center gap-2 text-sm font-medium ${
                inWishlist
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
              }`}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
              {inWishlist ? "Saved in Wishlist" : "Save for Later"}
            </button>
          </div>

          <p className="flex items-center gap-2 text-xs text-gray-400 mt-6 pt-4 border-t border-white/10">
            <Zap className="w-4 h-4 text-brand-400 shrink-0" /> Instant access after purchase — zero wait time, delivered directly to your account.
          </p>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Customer Reviews
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Verified reviews from real operators
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-400 font-bold text-lg">
                <Star className="w-5 h-5 fill-amber-400" /> {avgRating} / 5
              </div>
              <span className="text-xs text-gray-500">{reviewCount} total reviews</span>
            </div>
          </div>

          {/* Add Review Form */}
          {user ? (
            <form onSubmit={handleReviewSubmit} className="bg-white/5 p-5 rounded-2xl space-y-3 border border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">Write a Review</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Rating:</span>
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
                          star <= newRating ? "text-amber-400 fill-amber-400" : "text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                required
                rows={3}
                placeholder="Share your experience with this automation template..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 text-sm rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 focus:outline-none"
              />
              <div className="flex justify-end">
                <button type="submit" disabled={submittingReview} className="btn-primary text-xs py-2 px-4 gap-1.5">
                  <Send className="w-3.5 h-3.5" /> {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-white/5 rounded-2xl text-center text-xs text-gray-400 border border-white/5">
              Please <Link href="/login" className="text-brand-400 underline font-semibold">Sign In</Link> to post a review.
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4 divide-y divide-white/5">
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No customer reviews yet. Be the first to leave a review!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="pt-4 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">{rev.userName}</span>
                    <span className="text-[11px] text-gray-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? "fill-amber-400" : "text-gray-700"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-300 pt-1">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
