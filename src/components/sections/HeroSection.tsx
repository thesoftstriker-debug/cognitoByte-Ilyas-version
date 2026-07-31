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
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-50" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-50 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/3" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="label-tag mb-6">
              <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" /> AI
              Automation Agency
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-gray-950 mb-6">
              {hero.headline.split(" ").map((word, i) =>
                i >= 4 ? (
                  <span key={i} className="text-brand-500">
                    {word}{" "}
                  </span>
                ) : (
                  <span key={i}>{word} </span>
                ),
              )}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-8 max-w-lg">
              {hero.subheadline}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/projects" className="btn-primary text-sm px-5 py-2.5">
                {hero.ctaPrimary} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/pricing" className="btn-secondary text-sm px-5 py-2.5">
                {hero.ctaSecondary}
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-brand-300 to-brand-600"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  50+ automations
                </span>
                built for clients worldwide
              </p>
            </div>
          </div>
          <div className="relative hidden lg:block">
            {hero.image && (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                <Image
                  src={hero.image}
                  alt="CognitoByte Automation"
                  fill
                  className="object-cover"
                  priority
                />
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
