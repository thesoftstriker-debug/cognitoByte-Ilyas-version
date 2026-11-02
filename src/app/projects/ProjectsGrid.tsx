"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { CATEGORY_LABELS, cn } from "@/lib/utils";

interface ProjectItem {
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  imageUrl: string;
  videoUrl?: string;
  results: Array<{ metric: string; label: string }>;
}

const FILTERS = [
  { value: "all", label: "All Projects" },
  { value: "n8n", label: "n8n Automation" },
  { value: "ai-agent", label: "AI Agent" },
  { value: "chatbot", label: "Chatbot" },
  { value: "workflow", label: "Workflow" },
  { value: "web-dev", label: "Web Dev" },
];

export function ProjectsGrid({ projects }: { projects: ProjectItem[] }) {
  const [active, setActive] = useState("all");
  const filtered =
    active === "all" ? projects : projects.filter((p) => p.category === active);
  return (
    <section className="section-padding bg-[#08090f] min-h-[60vh]">
      <div className="container-tight">
        <div className="flex flex-wrap gap-2.5 mb-12">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActive(f.value)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border cursor-pointer active:scale-95",
                active === f.value
                  ? "bg-gradient-to-r from-brand-500 to-indigo-600 text-white border-brand-400 shadow-[0_0_20px_rgba(79,110,247,0.4)]"
                  : "bg-white/5 text-gray-300 border-white/10 hover:border-brand-500/40 hover:text-white hover:bg-white/10",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400 bg-gray-900/40 rounded-3xl border border-white/10">
            No projects in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((project, i) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="card group overflow-hidden hover:border-brand-500/50 hover:shadow-[0_0_35px_rgba(79,110,247,0.22)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full bg-gray-900/80 border border-white/10 backdrop-blur-xl"
              >
                <div className="relative aspect-video bg-gray-950 overflow-hidden shrink-0">
                  {project.imageUrl ? (
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-950 to-gray-900 flex items-center justify-center">
                      <span className="text-5xl font-black text-brand-400/40">
                        {project.title[0]}
                      </span>
                    </div>
                  )}
                  {/* Play icon overlay for projects with video */}
                  {project.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors duration-300">
                      <div className="w-13 h-13 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center group-hover:bg-brand-500 group-hover:scale-110 transition-all duration-300 shadow-xl border border-white/20">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}
                  {project.category && (
                    <span className="absolute top-3.5 left-3.5 text-xs font-bold bg-gray-950/80 backdrop-blur-md border border-brand-500/30 text-brand-300 px-3 py-1 rounded-full shadow-sm">
                      {CATEGORY_LABELS[project.category] || project.category}
                    </span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-white text-lg mb-2.5 group-hover:text-brand-300 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-6">
                    {project.shortDescription}
                  </p>
                  {project.results?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-auto">
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
        )}
      </div>
    </section>
  );
}
