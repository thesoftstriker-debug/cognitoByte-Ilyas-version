import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/utils";

interface ProjectItem {
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  imageUrl: string;
  videoUrl?: string;
  results: Array<{ metric: string; label: string }>;
}

export function ProjectsPreview({ projects }: { projects: ProjectItem[] }) {
  if (!projects?.length) return null;
  return (
    <section className="section-padding bg-gray-950">
      <div className="container-tight">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="label-tag bg-gray-800 border-gray-700 text-brand-400 mb-4">Our Work</div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Recent Projects</h2>
          </div>
          <Link href="/projects" className="text-gray-400 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors shrink-0">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-brand-500/50 transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative aspect-[16/9] bg-gray-800 overflow-hidden shrink-0">
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-600 text-4xl font-bold">{project.title[0]}</div>
                  </div>
                )}
                {/* Play icon overlay for video projects */}
                {project.videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-brand-500 transition-colors duration-300 shadow-lg">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                )}
                {project.category && (
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-semibold bg-brand-500 text-white px-2.5 py-1 rounded-full">
                      {CATEGORY_LABELS[project.category] || project.category}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-brand-400 transition-colors">{project.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{project.shortDescription}</p>
                {project.results?.length > 0 && (
                  <div className="mt-auto pt-4 flex flex-wrap gap-2">
                    {project.results.slice(0, 2).map((r, i) => (
                      <div key={i} className="bg-gray-800 rounded-lg px-3 py-1.5 text-center">
                        <p className="text-brand-400 font-bold text-sm">{r.metric}</p>
                        <p className="text-gray-500 text-xs">{r.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
