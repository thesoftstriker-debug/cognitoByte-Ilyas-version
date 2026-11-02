import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface HeroData {
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  image: string;
  stats: Array<{ value: string; label: string }>;
}
interface Props {
  hero: HeroData;
}
export function HeroSection({ hero }: Props) {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-[#08090f]">
      {/* Animated glowing mesh orbs in background */}
      <div className="absolute inset-0 dot-pattern opacity-60" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-600/25 rounded-full blur-[120px] pointer-events-none animate-blob" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[130px] pointer-events-none animate-blob animation-delay-200" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none animate-blob animation-delay-400" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-brand-300 bg-brand-500/15 border border-brand-500/30 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(79,110,247,0.3)] animate-fade-up">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              AI Automation Agency
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-white mb-6 animate-fade-up animate-delay-100">
              {hero.headline.split(" ").map((word, i) =>
                i >= 4 ? (
                  <span key={i} className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                    {word}{" "}
                  </span>
                ) : (
                  <span key={i}>{word} </span>
                ),
              )}
            </h1>

            <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-8 max-w-lg animate-fade-up animate-delay-200 font-normal">
              {hero.subheadline}
            </p>

            <div className="flex flex-wrap items-center gap-4 animate-fade-up animate-delay-300">
              <Link href="/projects" className="btn-primary text-sm px-6 py-3.5 shadow-xl shadow-brand-500/30">
                {hero.ctaPrimary} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/pricing" className="btn-secondary text-sm px-6 py-3.5">
                {hero.ctaSecondary}
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-3.5 animate-fade-up animate-delay-400">
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-[#08090f] bg-gradient-to-br from-brand-400 via-indigo-500 to-purple-600 shadow-md flex items-center justify-center text-[10px] font-bold text-white"
                  >
                    ✦
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 font-medium">
                <span className="font-bold text-white">50+ automations</span> built for forward-thinking clients
              </p>
            </div>
          </div>

          <div className="relative animate-fade-up animate-delay-200">
            {hero.image && (
              <div className="relative rounded-3xl overflow-hidden p-1.5 bg-gradient-to-br from-white/20 via-brand-500/30 to-purple-500/20 shadow-2xl shadow-brand-500/20 animate-float">
                <div className="relative aspect-[4/3] rounded-[22px] overflow-hidden bg-gray-950">
                  <Image
                    src={hero.image}
                    alt="CognitoByte Automation"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />
                </div>

                {/* Floating high-contrast mixed card overlay */}
                <div className="absolute -bottom-5 -left-5 bg-white/95 backdrop-blur-xl border border-white/60 text-gray-950 p-4 rounded-2xl shadow-2xl hidden sm:flex items-center gap-3 animate-float-delayed">
                  <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand-500/30">
                    ⚡
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Avg. Time Saved</p>
                    <p className="text-lg font-black text-gray-950">20+ hrs / week</p>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" /> Live Systems
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
function HeroIllustration() {
  return (
    <div className="relative">
      
      {/* Main card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        
        <div className="flex items-center gap-2 mb-4">
          
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-2 text-xs text-gray-400 font-mono">
            workflow.n8n
          </span>
        </div>
        {/* Workflow nodes */}
        <div className="space-y-3">
          
          {[
            {
              label: "Trigger: New Email",
              status: "done",
              color: "bg-green-100 text-green-700",
            },
            {
              label: "Extract Data with AI",
              status: "done",
              color: "bg-brand-100 text-brand-700",
            },
            {
              label: "Update CRM",
              status: "running",
              color: "bg-yellow-100 text-yellow-700",
            },
            {
              label: "Send Slack Alert",
              status: "pending",
              color: "bg-gray-100 text-gray-500",
            },
          ].map((node, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
            >
              
              <div
                className={`text-xs font-semibold px-2 py-1 rounded-md ${node.color}`}
              >
                
                {node.status === "done"
                  ? "✓"
                  : node.status === "running"
                    ? "⟳"
                    : "○"}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {node.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-400 font-mono">
          
          Executed in 1.2s · Saved 45 min/day
        </div>
      </div>
      {/* Floating badges */}
      <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
        
        Live ●
      </div>
      <div className="absolute -bottom-4 -left-4 bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-2.5">
        
        <p className="text-xs text-gray-500">Time saved today</p>
        <p className="text-xl font-bold text-brand-500">4.5 hrs</p>
      </div>
    </div>
  );
}
