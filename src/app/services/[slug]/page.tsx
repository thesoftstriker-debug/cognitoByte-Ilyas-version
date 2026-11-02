import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { getServiceBySlugFromDb } from "@/lib/data";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceBySlugFromDb(params.slug);
  return {
    title: service?.title || "Service",
    description: service?.shortDescription || "",
    alternates: {
      canonical: `/services/${params.slug}`,
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const service = await getServiceBySlugFromDb(params.slug);
  if (!service) notFound();

  return (
    <div className="pt-16">
      <section className="bg-gray-950 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Services
          </Link>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            {service.title}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            {service.shortDescription}
          </p>
        </div>
      </section>

      <section className="section-padding bg-[#08090f] text-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {service.imageUrl && (
                <div className="relative aspect-video rounded-3xl overflow-hidden mb-10 shadow-2xl border border-white/10">
                  <Image
                    src={service.imageUrl}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {service.description && (
                <div className="prose-custom mb-12">
                  {service.description.split("\n\n").map((p: string, i: number) => (
                    <p key={i} className="text-gray-300 leading-relaxed mb-4 text-base sm:text-lg">{p}</p>
                  ))}
                </div>
              )}

              {service.process?.length > 0 && (
                <div className="card p-8 bg-gray-900/70 border border-white/10 rounded-3xl mb-8">
                  <h3 className="text-2xl font-bold text-white mb-6">Our Process</h3>
                  <div className="space-y-6">
                    {service.process.map((step: any, i: number) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base mb-1">{step.title}</h4>
                          <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {service.features?.length > 0 && (
                <div className="card p-6 bg-gray-900/80 border border-white/10 rounded-3xl">
                  <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">What&apos;s Included</h3>
                  <ul className="space-y-3">
                    {service.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/25 border border-brand-400/30">
                <h3 className="font-black text-lg mb-2">Ready to get started?</h3>
                <p className="text-brand-100 text-sm mb-5 leading-relaxed">
                  Book a free discovery call and we&apos;ll scope your project.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold text-sm px-5 py-3 rounded-xl hover:bg-brand-50 transition-all w-full justify-center shadow-md active:scale-95"
                >
                  Book Free Call <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
