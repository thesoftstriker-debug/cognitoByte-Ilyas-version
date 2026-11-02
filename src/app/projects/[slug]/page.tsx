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

      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto">
          {project.imageUrl && !videoEmbedUrl && !isDirectVideo && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10">
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {videoEmbedUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 shadow-xl">
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
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 shadow-xl bg-black">
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
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">The Challenge</h2>
                  <p className="text-gray-600 leading-relaxed">{project.challenges}</p>
                </div>
              )}
              {project.solution && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Solution</h2>
                  <p className="text-gray-600 leading-relaxed">{project.solution}</p>
                </div>
              )}
              {project.description && (
                <div className="prose-custom">
                  {project.description.split("\n\n").map((p: string, i: number) => (
                    <p key={i} className="text-gray-700 leading-relaxed mb-4">{p}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {project.tags?.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-brand-500" /> Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string, i: number) => (
                      <span key={i} className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-brand-500 rounded-2xl p-5 text-white">
                <h3 className="font-bold mb-2">Want similar results?</h3>
                <p className="text-brand-100 text-sm mb-4">
                  Let&apos;s talk about your automation needs.
                </p>
                <Link href="/contact" className="inline-flex w-full justify-center bg-white text-brand-600 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-brand-50 transition-colors">
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
