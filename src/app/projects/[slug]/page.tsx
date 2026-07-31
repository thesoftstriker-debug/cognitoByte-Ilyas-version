import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Tag } from "lucide-react";
import { getProjectBySlugFromDb } from "@/lib/data";
import { getYouTubeEmbedUrl, formatDate, CATEGORY_LABELS } from "@/lib/utils";

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

  return (
    <div className="pt-16">
      <section className="bg-gray-950 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>

          {project.category && (
            <span className="inline-block text-xs font-bold bg-brand-500 text-white px-3 py-1 rounded-full mb-4">
              {CATEGORY_LABELS[project.category] || project.category}
            </span>
          )}

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {project.title}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mb-6">
            {project.shortDescription}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {project.client && (
              <span>
                Client: <span className="text-gray-300">{project.client}</span>
              </span>
            )}
            {project.publishedAt && (
              <span>{formatDate(project.publishedAt)}</span>
            )}
          </div>
        </div>
      </section>

      {project.results?.length > 0 && (
        <div className="bg-brand-500">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {project.results.map((r: any, i: number) => (
                <div key={i}>
                  <p className="text-3xl font-bold text-white">{r.metric}</p>
                  <p className="text-brand-100 text-sm">{r.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto">
          {project.imageUrl && !videoEmbedUrl && (
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
