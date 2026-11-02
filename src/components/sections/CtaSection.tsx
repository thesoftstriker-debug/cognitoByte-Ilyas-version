import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
export function CtaSection() {
  return (
    <section className="relative section-padding overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-700">
      {/* Decorative background glow rings */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-900/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="relative container-tight text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-6 border border-white/20 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Free Strategy Session
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight tracking-tight">
          Ready to automate your business?
        </h2>
        <p className="text-brand-100 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-normal">
          Book a free 30-minute discovery call. We&apos;ll map out exactly which
          automations will save you the most time and maximize your ROI.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 hover:shadow-2xl hover:shadow-brand-950/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-xl"
          >
            <Calendar className="w-4 h-4 text-brand-500" /> Book a Free Call
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 font-semibold px-8 py-4 rounded-xl hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm transition-all duration-200"
          >
            See Our Work <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
