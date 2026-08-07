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
              className="card rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col h-full"
            >
              <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden shrink-0">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-300 text-4xl font-bold">{product.name[0]}</div>
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                    {product.category}
                  </span>
                  <span className="text-lg font-bold font-mono text-gray-900">${product.price.toFixed(2)}</span>
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2 group-hover:text-brand-600 transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{product.description}</p>
                <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 group-hover:text-brand-700">
                  <ShoppingCart className="w-4 h-4" /> View deal
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}