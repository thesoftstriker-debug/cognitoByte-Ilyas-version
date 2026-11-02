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
    <section className="relative section-padding bg-[#090b14] overflow-hidden border-t border-white/5">
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative container-tight">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <div className="label-tag mb-4">Our Work</div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Recent Projects</h2>
          </div>
          <Link href="/projects" className="text-brand-300 hover:text-white flex items-center gap-1.5 text-sm font-semibold transition-all group shrink-0">
            View all projects <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group bg-gray-900/80 border border-white/10 rounded-3xl overflow-hidden hover:border-brand-500/50 hover:shadow-[0_0_35px_rgba(79,110,247,0.22)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full backdrop-blur-xl"
            >
              <div className="relative aspect-[16/9] bg-gray-950 overflow-hidden shrink-0">
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-950 to-gray-900">
                    <div className="text-brand-400/40 text-5xl font-black">{project.title[0]}</div>
                  </div>
                )}
                {/* Play icon overlay for video projects */}
                {project.videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors duration-300">
                    <div className="w-13 h-13 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center group-hover:bg-brand-500 group-hover:scale-110 transition-all duration-300 shadow-xl border border-white/20">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                )}
                {project.category && (
                  <div className="absolute top-3.5 left-3.5">
                    <span className="text-xs font-bold bg-gray-950/80 text-brand-300 border border-brand-500/30 px-3 py-1 rounded-full backdrop-blur-md shadow-sm">
                      {CATEGORY_LABELS[project.category] || project.category}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-white font-bold text-lg mb-2.5 group-hover:text-brand-300 transition-colors line-clamp-1">{project.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-6">{project.shortDescription}</p>
                {project.results?.length > 0 && (
                  <div className="mt-auto grid grid-cols-2 gap-2">
                    {project.results.slice(0, 2).map((r, i) => (
                      <div key={i} className="bg-brand-500/10 border border-brand-500/20 rounded-xl px-2.5 py-2 text-center min-w-0 transition-colors group-hover:bg-brand-500/15">
                        <p className="text-brand-300 font-bold text-sm truncate">{r.metric}</p>
                        <p className="text-gray-400 text-xs font-medium truncate">{r.label}</p>
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
