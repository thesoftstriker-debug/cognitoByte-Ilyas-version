"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";
import { ArrowLeft, ShoppingCart, Zap } from "lucide-react";

interface ProductDetail {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setProduct(data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addItem({ productId: product._id, name: product.name, price: product.price, slug: product.slug, imageUrl: product.imageUrl }));
    toast.success("Added to cart");
  };

  if (loading) {
    return (
      <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-28 pb-20 px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Product not found</h1>
        <Link href="/products" className="text-brand-600 hover:underline">Back to products</Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to products
        </Link>
        <div className="card p-6 sm:p-8">
          {product.imageUrl && (
            <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden mb-6">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold mt-3">{product.name}</h1>
            </div>
            <div className="text-3xl font-bold font-mono text-brand-600">${product.price.toFixed(2)}</div>
          </div>
          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
          {user?.role !== "admin" && (
            <button onClick={handleAddToCart} className="btn-primary text-sm py-2 px-4">
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
          )}
          <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-4">
            <Zap className="w-4 h-4 text-brand-500" /> Instant access after purchase — no waiting, delivered right to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
