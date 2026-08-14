import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
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
    <div className="pt-16">
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
        <section className="bg-white py-16 px-4 border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
            <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-950 mb-5 leading-tight">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {post.publishedAt && (
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(post.publishedAt)}</span>
              )}
              {post.readTime && (
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.readTime}</span>
              )}
              {post.category && (
                <span className="bg-brand-50 text-brand-600 text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
              )}
            </div>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="max-w-3xl mx-auto">
            {post.imageUrl && (
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 shadow-lg">
                <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
              </div>
            )}

            {post.body ? (
              <div className="prose-custom">
                {post.body.split("\n\n").map((p: string, i: number) => {
                  if (p.startsWith("# ")) return <h1 key={i} className="text-3xl font-bold mt-8 mb-4">{p.slice(2)}</h1>;
                  if (p.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold mt-6 mb-3">{p.slice(3)}</h2>;
                  if (p.startsWith("### ")) return <h3 key={i} className="text-xl font-bold mt-5 mb-2">{p.slice(4)}</h3>;
                  if (p.startsWith("> ")) return <blockquote key={i} className="border-l-4 border-brand-300 pl-4 italic text-gray-600 my-4">{p.slice(2)}</blockquote>;
                  if (p.startsWith("- ")) return <li key={i} className="text-gray-700 ml-4 list-disc">{p.slice(2)}</li>;
                  return <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>;
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">Content coming soon.</p>
            )}

            <div className="mt-16 p-8 bg-brand-500 rounded-2xl text-white text-center">
              <h3 className="text-2xl font-bold mb-2">Ready to automate your business?</h3>
              <p className="text-brand-100 mb-5">Book a free discovery call and let&apos;s map out your first automation.</p>
              <Link href="/contact" className="inline-flex bg-white text-brand-600 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors">
                Book Free Call
              </Link>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
