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
      <section className="bg-gray-950 py-24 px-4">
        
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="label-tag bg-gray-800 border-gray-700 text-brand-400 mb-6 mx-auto w-fit">
            Services
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-5">
            
            What We Build For You
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            
            Every service is designed to save you time, cut costs, and scale
            your operations without hiring more people.
          </p>
        </div>
      </section>
      {/* Services list */}
      <section className="section-padding bg-white">
        
        <div className="container-tight space-y-8">
          
          {services.map((service: any, i: number) => {
            const IconComponent = ICON_MAP[service.icon || "Zap"] || Zap;
            return (
              <div key={service.slug} className="card p-8 lg:p-10 group">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  
                  <div>
                    
                    <div className="flex items-center gap-4 mb-5">
                      
                      <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center">
                        
                        <IconComponent className="w-7 h-7 text-brand-500" />
                      </div>
                      <div>
                        
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          
                          Service {String(i + 1).padStart(2, "0")}
                        </span>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {service.title}
                        </h2>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {service.shortDescription}
                    </p>
                    <Link
                      href={`/services/${service.slug}`}
                      className="btn-primary"
                    >
                      
                      Learn More <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  {service.imageUrl || service.features?.length ? (
                    <div className="space-y-6">
                      {service.imageUrl && (
                        <div className="relative aspect-video rounded-2xl overflow-hidden">
                          <Image
                            src={service.imageUrl}
                            alt={service.title ?? ""}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      {service.features?.length ? (
                        <div className="bg-gray-50 rounded-2xl p-6">
                          
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                            What&apos;s included
                          </p>
                          <ul className="space-y-3">
                            
                            {service.features.map((f: string, fi: number) => (
                              <li
                                key={fi}
                                className="flex items-start gap-3 text-sm text-gray-700"
                              >
                                
                                <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                                  
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
          {!services.length && <p className="py-24 text-center text-gray-500">Data is currently unavailable. Please try again later.</p>}
        </div>
      </section>
    </div>
  );
}
