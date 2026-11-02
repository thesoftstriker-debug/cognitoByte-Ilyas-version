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
    <section className="section-padding bg-white">
      <div className="container-tight">
        <div className="flex flex-wrap gap-2 mb-10">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActive(f.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                active === f.value
                  ? "bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No projects in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project, i) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="card group overflow-hidden hover:border-brand-200"
              >
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  {project.imageUrl ? (
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                      <span className="text-5xl font-bold text-brand-200">
                        {project.title[0]}
                      </span>
                    </div>
                  )}
                  {/* Play icon overlay for projects with video */}
                  {project.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-brand-500 transition-colors duration-300 shadow-lg">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}
                  {project.category && (
                    <span className="absolute top-3 left-3 text-xs font-bold bg-white border border-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                      {CATEGORY_LABELS[project.category] || project.category}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
                    {project.shortDescription}
                  </p>
                  {project.results?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {project.results.slice(0, 2).map((r, i) => (
                        <div key={i} className="bg-brand-50 border border-brand-100 rounded-lg px-2 py-1.5 text-center min-w-0">
                          <p className="text-brand-600 font-bold text-sm truncate">{r.metric}</p>
                          <p className="text-brand-400 text-xs truncate">{r.label}</p>
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
