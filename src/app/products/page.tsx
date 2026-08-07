"use client";
import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Marketing & Copywriting",
  "Content Creation",
  "Business & Product Building",
  "Creative & Visual Design",
] as const;

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const activeCategory = searchParams.get("category") || "All";
  const limit = 12;

  const handleAddToCart = (product: ProductItem) => {
    dispatch(addItem({ productId: product._id, name: product.name, price: product.price, slug: product.slug, imageUrl: product.imageUrl }));
    toast.success(`${product.name} added to cart`);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (activeCategory !== "All") params.set("category", activeCategory);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Digital Assets</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Premium prompts, templates, and digital products to accelerate your workflow
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => {
            const href = cat === "All" ? "/products" : `/products?category=${encodeURIComponent(cat)}`;
            return (
              <Link
                key={cat}
                href={href}
                scroll={false}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  activeCategory === cat
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No products found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="card rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                <Link href={`/products/${product.slug}`} className="block flex-1">
                  {product.imageUrl && (
                    <div className="relative w-full h-40 -mt-0">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                      {product.category}
                    </span>
                    <span className="text-lg font-bold font-mono">${product.price.toFixed(2)}</span>
                  </div>
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  </div>
                </Link>
                <div className="px-5 pb-5">
                  {user?.role !== "admin" && (
                    <button onClick={() => handleAddToCart(product)} className="btn-primary text-xs py-1.5 px-3 gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {total > limit && (
          <div className="flex justify-center gap-3 mt-10">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="pt-28 pb-20 px-4 flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
