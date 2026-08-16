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
            const href =
              cat === "All" ? "/products" : `/products?category=${encodeURIComponent(cat)}`;
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

        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No products found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {total > limit && (
          <div className="flex justify-center gap-3 mt-10">
            <Link
              href={page > 1 ? `?${baseQuery}page=${page - 1}` : `?${baseQuery}page=1`}
              scroll={false}
              aria-disabled={page <= 1}
              className={cn(
                "px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40",
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
                "px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40",
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