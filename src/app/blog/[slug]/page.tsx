import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, Sparkles } from "lucide-react";
import { getBlogPostBySlug } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  const images = post?.imageUrl ? [{ url: post.imageUrl, width: 1600, height: 900, alt: post.title }] : [];
  return {
    title: post?.title || "Blog Post",
    description: post?.excerpt || "",
    alternates: {
      canonical: `/blog/${params.slug}`,
    },
    openGraph: {
      type: "article",
      title: post?.title || "Blog Post",
      description: post?.excerpt || "",
      url: `/blog/${params.slug}`,
      publishedTime: post?.publishedAt,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post?.title || "Blog Post",
      description: post?.excerpt || "",
      images,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <div className="pt-20 bg-[#08090f] text-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.imageUrl,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            author: { "@type": "Organization", name: "CognitoByte", url: "https://cognitobyte.com" },
            publisher: { "@type": "Organization", name: "CognitoByte" },
            mainEntityOfPage: `https://cognitobyte.com/blog/${post.slug}`,
          }),
        }}
      />
      <article>
        {/* Article Header */}
        <section className="relative py-16 px-4 border-b border-white/5 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />
          <div className="max-w-4xl mx-auto relative z-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Blog
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {formatDate(post.publishedAt)}
                </span>
              )}
              {post.readTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-500" />
                  {post.readTime}
                </span>
              )}
              {post.category && (
                <span className="bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {post.category}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Article Body */}
        <section className="section-padding bg-[#090b14]">
          <div className="max-w-4xl mx-auto">
            {post.imageUrl && (
              <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl border border-white/10">
                <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
              </div>
            )}

            {post.body ? (
              <div className="space-y-6 text-gray-300 leading-relaxed text-base sm:text-lg">
                {post.body.split("\n\n").map((p: string, i: number) => {
                  if (p.startsWith("# "))
                    return (
                      <h1 key={i} className="text-3xl font-extrabold text-white mt-10 mb-4 tracking-tight">
                        {p.slice(2)}
                      </h1>
                    );
                  if (p.startsWith("## "))
                    return (
                      <h2 key={i} className="text-2xl font-bold text-white mt-8 mb-3 tracking-tight">
                        {p.slice(3)}
                      </h2>
                    );
                  if (p.startsWith("### "))
                    return (
                      <h3 key={i} className="text-xl font-bold text-brand-300 mt-6 mb-2">
                        {p.slice(4)}
                      </h3>
                    );
                  if (p.startsWith("> "))
                    return (
                      <blockquote
                        key={i}
                        className="border-l-4 border-brand-400 pl-4 py-1 italic text-gray-300 bg-white/5 rounded-r-xl my-6"
                      >
                        {p.slice(2)}
                      </blockquote>
                    );
                  if (p.startsWith("- "))
                    return (
                      <li key={i} className="text-gray-300 ml-6 list-disc">
                        {p.slice(2)}
                      </li>
                    );
                  return (
                    <p key={i} className="text-gray-300 leading-relaxed mb-4">
                      {p}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">Content coming soon.</p>
            )}

            {/* Bottom Callout */}
            <div className="mt-16 p-8 sm:p-10 bg-gradient-to-b from-gray-900/90 via-gray-900/50 to-gray-950/90 border border-white/10 rounded-3xl text-white text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  Free Automation Blueprint
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-3 text-white">Ready to automate your operations?</h3>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm sm:text-base">
                  Book a free 30-minute discovery call and let&apos;s map out your high-ROI workflows.
                </p>
                <Link
                  href="/contact"
                  className="btn-primary inline-flex px-8 py-3.5"
                >
                  Book Discovery Call
                </Link>
              </div>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
