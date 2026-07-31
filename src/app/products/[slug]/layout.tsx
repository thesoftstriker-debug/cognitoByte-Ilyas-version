import type { Metadata } from "next";
import { findProductBySlug } from "@/lib/models/Product";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let name = "Product";
  let description = "";
  try {
    const product = await findProductBySlug(params.slug);
    name = product?.name || "Product";
    description = product?.description || "";
  } catch {
    // DB unavailable — fall back to generic metadata
  }
  return {
    title: name,
    description,
    alternates: {
      canonical: `/products/${params.slug}`,
    },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
