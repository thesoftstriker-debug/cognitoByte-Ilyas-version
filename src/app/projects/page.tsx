import type { Metadata } from "next";
import { getProjectsFromDb } from "@/lib/data";
import { ProjectsGrid } from "./ProjectsGrid";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Projects",
  description: "Portfolio of AI automation projects built by CognitoByte.",
  alternates: {
    canonical: "/projects",
  },
};
export default async function ProjectsPage() {
  const projects = await getProjectsFromDb();
  return (
    <div className="pt-16">
      
      <section className="relative bg-gray-950 py-24 px-4 overflow-hidden border-b border-gray-900">
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-brand-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="label-tag bg-gray-900/80 border-gray-800 text-brand-400 mb-6 mx-auto w-fit backdrop-blur-md shadow-sm shadow-brand-500/10">
            Portfolio & Case Studies
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-5 tracking-tight">
            Our Work
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Real automations. Real results. Browse our case studies and see what&apos;s possible for your business.
          </p>
        </div>
      </section>
      {projects.length ? <ProjectsGrid projects={projects} /> : <p className="py-24 text-center text-gray-500">Data is currently unavailable. Please try again later.</p>}
    </div>
  );
}
