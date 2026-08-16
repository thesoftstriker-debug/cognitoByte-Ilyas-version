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
    <div className="card rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block">
          {product.imageUrl ? (
            <div className="relative w-full h-40">
              <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
            </div>
          ) : (
            <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300">
              <ShoppingCart className="w-8 h-8" />
            </div>
          )}
        </Link>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
              {product.category}
            </span>
            <span className="text-lg font-bold font-mono text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="font-semibold text-lg mb-1 text-gray-900 hover:text-brand-600 block line-clamp-1"
          >
            {product.name}
          </Link>
          <p className="text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
        </div>
        <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
          {user?.role !== "admin" && (
            <button
              onClick={handleAddToCart}
              className="btn-primary text-xs py-1.5 px-3 gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
            </button>
          )}
          <Link
            href={`/products/${product.slug}`}
            className="text-xs font-medium text-brand-600 hover:underline ml-auto"
          >
            Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}