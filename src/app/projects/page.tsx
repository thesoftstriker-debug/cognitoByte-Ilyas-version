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
      
      <section className="bg-gray-950 py-24 px-4">
        
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="label-tag bg-gray-800 border-gray-700 text-brand-400 mb-6 mx-auto w-fit">
            Portfolio
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-5">
            Our Work
          </h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            
            Real automations. Real results. Browse our case studies and see
            what&apos;s possible.
          </p>
        </div>
      </section>
      <ProjectsGrid projects={projects} />
    </div>
  );
}
