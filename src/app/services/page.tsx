import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Zap,
  Bot,
  MessageSquare,
  Workflow,
  Brain,
  Settings,
} from "lucide-react";
import { getServicesFromDb } from "@/lib/data";
export const metadata: Metadata = {
  title: "Services",
  description:
    "n8n Automations, AI Agents, Chatbot Building, and Workflow Design by CognitoByte.",
  alternates: {
    canonical: "/services",
  },
};
const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  Bot,
  MessageSquare,
  Workflow,
  Brain,
  Settings,
};
export const dynamic = "force-dynamic";
export default async function ServicesPage() {
  const services = await getServicesFromDb();
  return (
    <div className="pt-16">
      
      {/* Header */}
      <section className="relative bg-gray-950 py-24 px-4 overflow-hidden border-b border-gray-900">
        <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-brand-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="label-tag bg-gray-900/90 border-gray-800 text-brand-400 mb-6 mx-auto w-fit backdrop-blur-md shadow-sm">
            Core Offerings
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-5 tracking-tight">
            What We Build For You
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Every service is engineered to save you time, cut costs, and scale
            your operations without adding headcount.
          </p>
        </div>
      </section>
      {/* Services list */}
      <section className="section-padding bg-[#08090f]">
        <div className="container-tight space-y-10">
          {services.map((service: any, i: number) => {
            const IconComponent = ICON_MAP[service.icon || "Zap"] || Zap;
            return (
              <div
                key={service.slug}
                className="card p-8 lg:p-10 group bg-gray-900/80 border border-white/10 hover:border-brand-500/50 hover:shadow-[0_0_35px_rgba(79,110,247,0.22)] transition-all duration-300 rounded-3xl backdrop-blur-xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/30 group-hover:bg-brand-500 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(79,110,247,0.5)]">
                        <IconComponent className="w-7 h-7 text-brand-300 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-brand-400 tracking-widest uppercase">
                          Service {String(i + 1).padStart(2, "0")}
                        </span>
                        <h2 className="text-2xl font-bold text-white group-hover:text-brand-300 transition-colors">
                          {service.title}
                        </h2>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-8 text-base">
                      {service.shortDescription}
                    </p>
                    <Link
                      href={`/services/${service.slug}`}
                      className="btn-primary shadow-lg shadow-brand-500/25"
                    >
                      Learn More <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  {service.imageUrl || service.features?.length ? (
                    <div className="space-y-6">
                      {service.imageUrl && (
                        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl border border-white/10 group-hover:border-brand-500/30 transition-all">
                          <Image
                            src={service.imageUrl}
                            alt={service.title ?? ""}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                        </div>
                      )}
                      {service.features?.length ? (
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                          <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-4">
                            What&apos;s included
                          </p>
                          <ul className="space-y-3">
                            {service.features.map((f: string, fi: number) => (
                              <li
                                key={fi}
                                className="flex items-start gap-3 text-sm text-gray-300 font-medium"
                              >
                                <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-brand-500/50">
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 12 12"
                                  >
                                    <path
                                      d="M10 3L5 9 2 6"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      fill="none"
                                    />
                                  </svg>
                                </span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
          {!services.length && <p className="py-24 text-center text-gray-400 bg-gray-900/40 rounded-3xl border border-white/10">Data is currently unavailable. Please try again later.</p>}
        </div>
      </section>
    </div>
  );
}
