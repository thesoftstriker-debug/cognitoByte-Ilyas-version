import Link from "next/link";
import { ArrowRight, Zap, Bot, MessageSquare, Workflow, Brain, Settings } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Zap, Bot, MessageSquare, Workflow, Brain, Settings,
};

export function ServicesSection({ services }: { services: any[] }) {
  return (
    <section className="relative section-padding bg-[#08090f] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative container-tight">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="label-tag mb-4 mx-auto w-fit">What We Do</div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 max-w-3xl mx-auto tracking-tight">
            EVERYTHING YOU NEED TO{" "}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">AUTOMATE AND SCALE</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            From simple task automation to full AI agent deployments — we build
            it all, end-to-end.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {services.map((service, i) => {
            const IconComponent = ICON_MAP[service.icon] || Zap;
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="card p-8 group cursor-pointer bg-gray-900/70 border border-white/10 hover:border-brand-500/50 hover:shadow-[0_0_30px_rgba(79,110,247,0.2)] hover:-translate-y-1.5 transition-all duration-300 rounded-3xl"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/30 group-hover:bg-brand-500 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(79,110,247,0.5)]">
                    <IconComponent className="w-7 h-7 text-brand-300 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {service.shortDescription}
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-brand-400 text-sm font-semibold opacity-80 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1">
                  Learn more <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
              </Link>
            );
          })}
        </div>
        <div className="text-center mt-12">
          <Link href="/services" className="btn-secondary shadow-lg">
            View All Services <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
