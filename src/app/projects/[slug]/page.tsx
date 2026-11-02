import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Tag } from "lucide-react";
import { getProjectBySlugFromDb } from "@/lib/data";
import { getYouTubeEmbedUrl, isDirectVideoUrl, formatDate, CATEGORY_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlugFromDb(params.slug);
  return {
    title: project?.title || "Project",
    description: project?.shortDescription || "",
    alternates: {
      canonical: `/projects/${params.slug}`,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProjectBySlugFromDb(params.slug);
  if (!project) notFound();

  const videoEmbedUrl = project.videoUrl
    ? getYouTubeEmbedUrl(project.videoUrl)
    : null;
  const isDirectVideo = project.videoUrl ? isDirectVideoUrl(project.videoUrl) : false;

  return (
    <div className="pt-16">
      <section className="relative bg-gray-950 py-20 px-4 overflow-hidden border-b border-gray-900">
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-brand-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Projects
          </Link>

          {project.category && (
            <span className="inline-block text-xs font-bold bg-brand-500 text-white px-3.5 py-1 rounded-full mb-4 shadow-sm shadow-brand-500/25">
              {CATEGORY_LABELS[project.category] || project.category}
            </span>
          )}

          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
            {project.title}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-6 leading-relaxed">
            {project.shortDescription}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-medium">
            {project.client && (
              <span>
                Client: <span className="text-white font-semibold">{project.client}</span>
              </span>
            )}
            {project.publishedAt && (
              <span>• {formatDate(project.publishedAt)}</span>
            )}
          </div>
        </div>
      </section>

      {project.results?.length > 0 && (
        <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 shadow-inner">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center divide-x divide-white/10">
              {project.results.map((r: any, i: number) => (
                <div key={i} className="px-2">
                  <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">{r.metric}</p>
                  <p className="text-brand-100 text-xs sm:text-sm font-medium mt-1">{r.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="section-padding bg-[#08090f] text-gray-100">
        <div className="max-w-4xl mx-auto">
          {project.imageUrl && !videoEmbedUrl && !isDirectVideo && (
            <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl border border-white/10">
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {videoEmbedUrl && (
            <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl border border-white/10">
              <iframe
                src={videoEmbedUrl}
                title={project.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}

          {isDirectVideo && (
            <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl bg-black border border-white/15">
              <video
                src={project.videoUrl}
                controls
                playsInline
                poster={project.imageUrl || undefined}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {project.challenges && (
                <div className="card p-7 bg-gray-900/70 border border-white/10 rounded-3xl">
                  <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> The Challenge
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{project.challenges}</p>
                </div>
              )}
              {project.solution && (
                <div className="card p-7 bg-gray-900/70 border border-white/10 rounded-3xl">
                  <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Our Solution
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{project.solution}</p>
                </div>
              )}
              {project.description && (
                <div className="prose-custom">
                  {project.description.split("\n\n").map((p: string, i: number) => (
                    <p key={i} className="text-gray-300 leading-relaxed mb-4 text-base">{p}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {project.tags?.length > 0 && (
                <div className="card p-6 bg-gray-900/80 border border-white/10 rounded-3xl">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Tag className="w-4 h-4 text-brand-400" /> Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string, i: number) => (
                      <span key={i} className="bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-semibold px-3 py-1.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/20 border border-brand-400/30">
                <h3 className="font-black text-lg mb-2">Want similar results?</h3>
                <p className="text-brand-100 text-sm mb-5 leading-relaxed">
                  Let&apos;s talk about your automation needs and how we can replicate this for you.
                </p>
                <Link href="/contact" className="inline-flex w-full justify-center bg-white text-brand-600 font-bold text-sm px-4 py-3 rounded-xl hover:bg-brand-50 transition-all shadow-md active:scale-95">
                  Start a Project
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
