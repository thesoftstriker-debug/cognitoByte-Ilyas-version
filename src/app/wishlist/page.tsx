"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      if (res.ok) {
        setWishlist(data.wishlist || []);
      }
    } catch {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchWishlist();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
      if (res.ok) {
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
        toast.success("Removed from wishlist");
      }
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleAddToCart = (product: ProductItem) => {
    dispatch(
      addItem({
        productId: product._id,
        name: product.name,
        price: product.price,
        slug: product.slug,
        imageUrl: product.imageUrl,
      })
    );
    toast.success(`${product.name} added to cart!`);
  };

  if (authLoading || loading) {
    return (
      <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
          <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-28 pb-20 px-4 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Please Sign In</h1>
        <p className="text-sm text-gray-500 mb-6">
          You need to be logged in to view and manage your saved wishlist products.
        </p>
        <Link href="/login?redirect=/wishlist" className="btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" /> Saved Wishlist
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {wishlist.length} {wishlist.length === 1 ? "saved asset" : "saved assets"}
          </p>
        </div>
        <Link href="/products" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Continue Browsing
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="card p-12 text-center max-w-md mx-auto">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Your wishlist is empty</h3>
          <p className="text-sm text-gray-500 mb-6">
            Click the heart icon on any product to save items for later.
          </p>
          <Link href="/products" className="btn-primary">
            Browse Digital Assets
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <div key={product._id} className="card p-4 flex flex-col justify-between">
              <div>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-44 object-cover rounded-xl border border-gray-100 mb-4"
                  />
                ) : (
                  <div className="w-full h-44 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                  {product.category}
                </span>
                <h3 className="font-bold text-gray-900 text-lg mt-2 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.description}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xl font-bold font-mono text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn-primary text-xs py-2 px-3 gap-1.5"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
