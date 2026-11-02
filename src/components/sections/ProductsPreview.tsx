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
    <section className="relative section-padding bg-[#08090f] overflow-hidden border-t border-white/5">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative container-tight">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="label-tag mb-4">Digital Assets</div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Ready-to-Use Digital Assets</h2>
          </div>
          <Link href="/products" className="text-brand-300 hover:text-white flex items-center gap-1.5 text-sm font-semibold transition-all group shrink-0">
            Browse all assets <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mb-14 leading-relaxed">
          Premium AI prompts, automation templates, and digital products that let you skip the
          grunt work and ship faster — no setup headaches, instant access.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              className="card group rounded-3xl overflow-hidden hover:border-brand-500/50 hover:shadow-[0_0_35px_rgba(79,110,247,0.22)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full bg-gray-900/80 border border-white/10 backdrop-blur-xl"
            >
              <div className="relative aspect-[16/9] bg-gray-950 overflow-hidden shrink-0">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-950 to-gray-900">
                    <div className="text-brand-400/40 text-4xl font-black">{product.name[0]}</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-brand-300 bg-brand-500/15 border border-brand-500/30 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {product.category}
                  </span>
                  <span className="text-xl font-black font-mono text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">${product.price.toFixed(2)}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-brand-300 transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-6">{product.description}</p>
                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 group-hover:text-white transition-colors">
                    <ShoppingCart className="w-4 h-4 transition-transform group-hover:scale-110" /> View asset
                  </span>
                  <span className="text-xs text-gray-500 font-medium group-hover:text-brand-300 transition-colors flex items-center gap-1">
                    Instant access <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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