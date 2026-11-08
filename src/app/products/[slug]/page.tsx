import Link from "next/link";
import { findProductBySlug } from "@/lib/models/Product";
import { getReviewsByProduct, getAverageRating } from "@/lib/models/Review";
import { ProductDetailClient, type ProductDetail, type Review } from "./ProductDetailClient";

export const dynamic = "force-dynamic";

const BASE_URL = "https://cognitobyte.com";

interface Props {
  params: { slug: string };
}

export default async function ProductDetailPage({ params }: Props) {
  let product: ProductDetail | null = null;
  let reviews: Review[] = [];
  let avgRating = 5;
  let reviewCount = 0;

  try {
    const doc = await findProductBySlug(params.slug);
    if (doc) {
      product = {
        _id: doc._id.toString(),
        name: doc.name,
        slug: doc.slug,
        description: doc.description,
        price: doc.price,
        category: doc.category,
        imageUrl: doc.imageUrl ?? undefined,
      };
      try {
        const productId = doc._id.toString();
        const [reviewDocs, summary] = await Promise.all([
          getReviewsByProduct(productId),
          getAverageRating(productId),
        ]);
        reviews = reviewDocs.map((r: any) => ({
          _id: r._id.toString(),
          userName: r.userName,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
        }));
        avgRating = summary.rating;
        reviewCount = summary.count;
      } catch {
        // Reviews unavailable — render product with empty reviews
      }
    }
  } catch {
    product = null;
  }

  if (!product) {
    return (
      <div className="pt-28 pb-20 px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Product not found</h1>
        <Link href="/products" className="text-brand-600 hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  const productUrl = `${BASE_URL}/products/${product.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.imageUrl || undefined,
        sku: product._id,
        category: product.category || undefined,
        brand: { "@type": "Brand", name: "CognitoByte" },
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: productUrl,
        },
        ...(reviewCount > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: avgRating,
                reviewCount,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Products", item: `${BASE_URL}/products` },
          { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        slug={params.slug}
        initialReviews={reviews}
        initialAvgRating={avgRating}
        initialReviewCount={reviewCount}
      />
    </>
  );
}