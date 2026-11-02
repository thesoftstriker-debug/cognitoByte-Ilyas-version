import Link from "next/link";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative py-20 px-4 bg-[#08090f] overflow-hidden">
      {/* Background ambient radial glow spots */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-r from-brand-500/15 via-indigo-500/15 to-purple-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-b from-gray-900/90 via-gray-900/50 to-gray-950/90 border border-white/10 p-8 sm:p-14 lg:p-16 text-center backdrop-blur-2xl shadow-2xl overflow-hidden group">
          {/* Top highlight line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
          
          {/* Subtle perimeter glow on hover */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-700 pointer-events-none" />

          <div className="relative z-10">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Free Strategy Session</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 leading-tight tracking-tight">
              Ready to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400">
                automate your business?
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-normal">
              Book a free 30-minute discovery call. We&apos;ll audit your current workflow and map out exactly which automations will save you 20+ hours a week.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base font-bold shadow-xl shadow-brand-500/25 group/btn"
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>Book a Free Call</span>
              </Link>
              <Link
                href="/projects"
                className="btn-secondary inline-flex items-center gap-2 px-8 py-4 text-base font-semibold"
              >
                <span>See Our Work</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
