import Link from "next/link";
import { findAllProducts } from "@/lib/models/Product";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "All",
  "Marketing & Copywriting",
  "Content Creation",
  "Business & Product Building",
  "Creative & Visual Design",
] as const;

interface ProductsPageProps {
  searchParams: { category?: string; page?: string };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const activeCategory = searchParams.category || "All";
  const rawPage = parseInt(searchParams.page || "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = 12;

  let products: Array<{
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
  }> = [];
  let total = 0;

  try {
    const result = await findAllProducts(
      activeCategory === "All" ? undefined : activeCategory,
      undefined,
      page,
      limit
    );
    products = result.products.map((p: any) => ({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      category: p.category,
      imageUrl: p.imageUrl ?? undefined,
    }));
    total = result.total;
  } catch {
    products = [];
    total = 0;
  }

  const totalPages = Math.ceil(total / limit);
  const baseQuery =
    activeCategory === "All"
      ? ""
      : `category=${encodeURIComponent(activeCategory)}&`;

  return (
    <div className="min-h-screen bg-[#08090f] text-white pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="label-tag mb-4 mx-auto w-fit">Marketplace</div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">Digital Assets</h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Premium prompts, templates, and digital products to accelerate your workflow
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5 mb-14">
          {CATEGORIES.map((cat) => {
            const href =
              cat === "All" ? "/products" : `/products?category=${encodeURIComponent(cat)}`;
            return (
              <Link
                key={cat}
                href={href}
                scroll={false}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border cursor-pointer active:scale-95",
                  activeCategory === cat
                    ? "bg-gradient-to-r from-brand-500 to-indigo-600 text-white border-brand-400 shadow-[0_0_20px_rgba(79,110,247,0.4)]"
                    : "bg-white/5 text-gray-300 border-white/10 hover:border-brand-500/40 hover:text-white hover:bg-white/10"
                )}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 text-gray-400 bg-gray-900/40 rounded-3xl border border-white/10">
            <p className="text-lg font-medium">No products found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {total > limit && (
          <div className="flex justify-center gap-3 mt-14">
            <Link
              href={page > 1 ? `?${baseQuery}page=${page - 1}` : `?${baseQuery}page=1`}
              scroll={false}
              aria-disabled={page <= 1}
              className={cn(
                "px-5 py-2.5 text-sm font-semibold rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all hover:border-brand-500/40 disabled:opacity-40 active:scale-95",
                page <= 1 && "opacity-40 pointer-events-none"
              )}
            >
              Previous
            </Link>
            <Link
              href={page < totalPages ? `?${baseQuery}page=${page + 1}` : `?${baseQuery}page=${page}`}
              scroll={false}
              aria-disabled={page >= totalPages}
              className={cn(
                "px-5 py-2.5 text-sm font-semibold rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all hover:border-brand-500/40 disabled:opacity-40 active:scale-95",
                page >= totalPages && "opacity-40 pointer-events-none"
              )}
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}