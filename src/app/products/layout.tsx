import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse ready-made AI prompts, automation templates, and digital products from CognitoByte.",
  alternates: {
    canonical: "/products",
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
