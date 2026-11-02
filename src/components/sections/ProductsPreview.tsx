import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingCart } from "lucide-react";

interface ProductItem {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export function ProductsPreview({ products }: { products: ProductItem[] }) {
  if (!products?.length) return null;
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-tight">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="label-tag bg-brand-50 border-brand-100 text-brand-600 mb-4">Digital Assets</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-950">Ready-to-Use Digital Assets</h2>
          </div>
          <Link href="/products" className="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-sm font-medium transition-colors shrink-0">
            Browse all assets <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <p className="text-gray-500 text-lg max-w-2xl mb-12">
          Premium AI prompts, automation templates, and digital products that let you skip the
          grunt work and ship faster — no setup headaches, instant access.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              className="card group rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-200 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full bg-white"
            >
              <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden shrink-0">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-50 to-indigo-50">
                    <div className="text-brand-300 text-4xl font-black">{product.name[0]}</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold text-brand-600 bg-brand-50/90 border border-brand-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    {product.category}
                  </span>
                  <span className="text-xl font-bold font-mono text-gray-950">${product.price.toFixed(2)}</span>
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2 group-hover:text-brand-600 transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">{product.description}</p>
                <div className="mt-auto pt-4 border-t border-gray-100/80 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
                    <ShoppingCart className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /> View asset
                  </span>
                  <span className="text-xs text-gray-400 font-medium group-hover:text-brand-500 transition-colors flex items-center gap-0.5">
                    Instant access <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}