import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, PenLine } from "lucide-react";
import { getBlogPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import BlogSortSelect from "@/components/blog/BlogSortSelect";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Automation tips, AI insights, and case studies from CognitoByte.",
  alternates: {
    canonical: "/blog",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  automation: "bg-blue-100 text-blue-700",
  ai: "bg-purple-100 text-purple-700",
  "case-study": "bg-green-100 text-green-700",
  tutorial: "bg-orange-100 text-orange-700",
  news: "bg-gray-100 text-gray-700",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const sort = searchParams.sort === "old" ? "old" : "new";
  const data = await getBlogPosts(sort);

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-white py-24 px-4 border-b border-gray-100 text-center">
        <div className="label-tag mb-6 mx-auto w-fit">Blog</div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-950 mb-4">
          Automation Insights
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto">
          Tips, tutorials, and case studies on AI automation and n8n workflows.
        </p>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-tight">
          {data.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
                <PenLine className="w-8 h-8 text-brand-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Articles coming soon
              </h2>
              <p className="text-gray-500 max-sm mb-8">
                We&apos;re writing up our first batch of automation tips and AI
                guides. Check back shortly!
              </p>
              <Link href="/contact" className="btn-primary">
                Get notified when we publish
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm text-gray-500">
                  {data.length} articles
                </p>
                <BlogSortSelect value={sort} />
              </div>
              {/* ── Blog grid ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((post: any) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="card overflow-hidden group hover:border-brand-200"
                >
                  <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                        <span className="text-5xl">✍️</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      {post.category && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {post.category}
                        </span>
                      )}
                      {post.readTime && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {post.readTime}
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    {post.publishedAt && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.publishedAt)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
