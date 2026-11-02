"use client";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export function ProductCard({ product }: { product: ProductItem }) {
  const dispatch = useDispatch();
  const { user } = useAuth();

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
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="card group rounded-3xl overflow-hidden flex flex-col hover:shadow-[0_0_35px_rgba(79,110,247,0.22)] hover:border-brand-500/50 transition-all duration-300 hover:-translate-y-1.5 bg-gray-900/80 border border-white/10 backdrop-blur-xl">
      <div className="relative overflow-hidden bg-gray-950">
        <Link href={`/products/${product.slug}`} className="block">
          {product.imageUrl ? (
            <div className="relative w-full h-48 overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-brand-950 to-gray-900 flex items-center justify-center text-brand-400/40">
              <ShoppingCart className="w-10 h-10" />
            </div>
          )}
        </Link>
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-bold text-brand-300 bg-brand-500/15 border border-brand-500/30 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {product.category}
            </span>
            <span className="text-xl font-black font-mono text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="font-bold text-lg mb-2 text-white group-hover:text-brand-300 transition-colors block line-clamp-1"
          >
            {product.name}
          </Link>
          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>
        <div className="pt-4 mt-auto border-t border-white/10 flex items-center justify-between">
          {user?.role !== "admin" && (
            <button
              onClick={handleAddToCart}
              className="btn-primary text-xs py-2 px-4 gap-1.5 shadow-md shadow-brand-500/20 active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
            </button>
          )}
          <Link
            href={`/products/${product.slug}`}
            className="text-xs font-semibold text-brand-300 hover:text-white transition-colors ml-auto flex items-center gap-1 group-hover:translate-x-0.5"
          >
            Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}