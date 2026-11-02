import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, PenLine, Sparkles, ArrowRight } from "lucide-react";
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
  automation: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  ai: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  "case-study": "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  tutorial: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  news: "bg-gray-500/10 text-gray-300 border border-gray-500/20",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const sort = searchParams.sort === "old" ? "old" : "new";
  const data = await getBlogPosts(sort);

  return (
    <div className="pt-20 bg-[#08090f] text-white min-h-screen">
      {/* Header */}
      <section className="relative py-24 px-4 border-b border-white/5 text-center overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Knowledge Base & Insights</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">
            Automation Insights
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
            Architectural guides, production tips, and case studies on AI automation and n8n pipelines.
          </p>
        </div>
      </section>

      <section className="section-padding bg-[#090b14]">
        <div className="container-tight">
          {data.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6 shadow-sm">
                <PenLine className="w-8 h-8 text-brand-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Articles Coming Soon
              </h2>
              <p className="text-gray-400 max-w-sm mb-8 text-sm">
                We&apos;re publishing deep-dive technical tutorials and ROI playbooks. Check back shortly!
              </p>
              <Link href="/contact" className="btn-primary">
                <span>Get Notified When We Publish</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm font-semibold text-gray-400">
                  {data.length} articles published
                </p>
                <BlogSortSelect value={sort} />
              </div>

              {/* ── Blog grid ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {data.map((post: any) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="bg-gray-900/80 border border-white/10 rounded-2xl overflow-hidden group hover:border-brand-500/40 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full backdrop-blur-md"
                  >
                    <div className="relative aspect-video bg-gray-950 overflow-hidden shrink-0">
                      {post.imageUrl ? (
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 to-gray-900 flex items-center justify-center">
                          <span className="text-5xl">⚡</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {post.category && (
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              CATEGORY_COLORS[post.category] || "bg-gray-800 text-gray-300 border border-white/10"
                            }`}
                          >
                            {post.category}
                          </span>
                        )}
                        {post.readTime && (
                          <span className="text-xs text-gray-400 font-medium flex items-center gap-1 ml-auto">
                            <Clock className="w-3.5 h-3.5 text-gray-500" /> {post.readTime}
                          </span>
                        )}
                      </div>
                      <h2 className="font-bold text-white text-lg mb-2 group-hover:text-brand-300 transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-5">
                        {post.excerpt}
                      </p>
                      {post.publishedAt && (
                        <div className="mt-auto pt-4 border-t border-white/10 flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
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
