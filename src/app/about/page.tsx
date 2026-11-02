import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Users, Lightbulb, Settings, Workflow, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about CognitoByte — the AI automation agency helping businesses scale with smart workflows.",
  alternates: {
    canonical: "/about",
  },
};

const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  Shield,
  Users,
  Lightbulb,
  Settings,
  Workflow,
};

const ABOUT = {
  headline: "ENGINEERING AUTONOMY FOR MODERN ENTERPRISES",
  subheadline:
    "We're obsessed with saving your time — building resilient n8n pipelines and intelligent AI agents so your team can focus on high-impact work that actually needs a human.",
  image: "/images/about-main.png",
  story: [
    "CognitoByte is an AI automation agency based in Islamabad, Pakistan. We build n8n workflows, autonomous AI agents, and custom chatbots that handle the repetitive work — so your team can focus on the work that actually needs human ingenuity.",
    "CognitoByte started with a simple observation: most modern businesses waste hundreds of hours every month on tasks that don't need a human doing them — copying data between disparate tools, posting content across platforms, manually qualifying leads, and answering repetitive customer inquiries.",
    "We build automation systems, AI agents, and chatbots that take that work off your plate — using tools like n8n, modern LLMs, and clean, maintainable architecture. Everything we build is designed to be managed through transparent dashboards, not endless brittle code changes, so you stay in complete control.",
    "Our approach is direct: audit what's actually slowing you down, build an automated solution specific to your business, and hand it off in a way you can instantly use and scale.",
  ],
  values: [
    {
      icon: "Zap",
      title: "Practical Over Flashy",
      description: "We build systems that solve real revenue problems, not automation for the sake of novelty.",
    },
    {
      icon: "Settings",
      title: "Radical Transparency",
      description: "No black-box solutions. You completely understand and own the workflows we construct for you.",
    },
    {
      icon: "Workflow",
      title: "Built to Last",
      description: "Automations designed with retry logic, sandboxing, and minimal upkeep so they never break silently.",
    },
  ],
};

export default function AboutPage() {
  return (
    <div className="pt-20 bg-[#08090f] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Glow gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>About CognitoByte</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                {ABOUT.headline}
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                {ABOUT.subheadline}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/contact" className="btn-primary">
                  <span>Start a Project</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/projects" className="btn-secondary">
                  <span>Explore Case Studies</span>
                </Link>
              </div>
            </div>

            <div className="relative">
              {ABOUT.image && (
                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                  <Image
                    src={ABOUT.image}
                    alt="About CognitoByte"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090f]/80 via-transparent to-transparent pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-[#090b14] border-y border-white/5 relative">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-4">
            Our Origins
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 tracking-tight">
            How We Started & Why We Automate
          </h2>
          <div className="space-y-6">
            {ABOUT.story.map((p, i) => (
              <p key={i} className="text-gray-300 leading-relaxed text-base sm:text-lg">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy / Values Section */}
      <section className="section-padding bg-[#08090f]">
        <div className="container-tight">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-4">
              Core Principles
            </div>
            <h2 className="text-4xl font-black text-white mb-3 tracking-tight">How We Deliver Value</h2>
            <p className="text-gray-400 text-lg">The core operating principles that guide every client deployment.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {ABOUT.values.map((v, i) => {
              const IconComponent = ICON_MAP[v.icon] || Zap;
              return (
                <div
                  key={i}
                  className="bg-gray-900/70 border border-white/10 rounded-2xl p-8 hover:border-brand-500/40 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10 group backdrop-blur-md"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 group-hover:bg-brand-500 flex items-center justify-center mb-6 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-brand-500/40">
                    <IconComponent className="w-6 h-6 text-brand-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-white text-xl mb-3 group-hover:text-brand-300 transition-colors">
                    {v.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="py-16 bg-[#090b14] border-t border-white/5">
        <div className="container-tight">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Automations Built", value: "50+" },
              { label: "Hours Saved", value: "2,000+" },
              { label: "Happy Clients", value: "30+" },
              { label: "Countries Served", value: "8+" },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-900/60 border border-white/5 rounded-2xl p-6 text-center hover:border-brand-500/30 transition-all">
                <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500 mb-1">
                  {stat.value}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
