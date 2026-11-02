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
      <section className="relative bg-gradient-to-b from-white via-brand-50/20 to-gray-50 py-24 px-4 border-b border-gray-100 text-center overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-brand-100/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="relative max-w-3xl mx-auto">
          <div className="label-tag mb-6 mx-auto w-fit">Knowledge Base</div>
          <h1 className="text-5xl sm:text-6xl font-black text-gray-950 mb-4 tracking-tight">
            Automation Insights
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            Tips, tutorials, and case studies on AI automation and n8n workflows.
          </p>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-tight">
          {data.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-6 shadow-sm">
                <PenLine className="w-8 h-8 text-brand-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Articles coming soon
              </h2>
              <p className="text-gray-500 max-sm mb-8">
                We&apos;re writing up our first batch of automation tips and AI
                guides. Check back shortly!
              </p>
              <Link href="/contact" className="btn-primary shadow-lg shadow-brand-500/25">
                Get notified when we publish
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm font-semibold text-gray-500">
                  {data.length} articles
                </p>
                <BlogSortSelect value={sort} />
              </div>
              {/* ── Blog grid ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {data.map((post: any) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="card overflow-hidden group hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full bg-white"
                >
                  <div className="relative aspect-video bg-gray-100 overflow-hidden shrink-0">
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                        <span className="text-5xl">✍️</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {post.category && (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {post.category}
                        </span>
                      )}
                      {post.readTime && (
                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1 ml-auto">
                          <Clock className="w-3.5 h-3.5" /> {post.readTime}
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-gray-950 text-lg mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-5">
                      {post.excerpt}
                    </p>
                    {post.publishedAt && (
                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
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
