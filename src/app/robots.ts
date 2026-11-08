import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/login", "/signup", "/api", "/cart", "/wishlist", "/my-orders"],
    },
    sitemap: "https://cognitobyte.com/sitemap.xml",
  };
}
