import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Users, Lightbulb, Settings, Workflow } from "lucide-react";
export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about CognitoByte — the AI automation agency helping businesses scale with smart workflows.",
  alternates: {
    canonical: "/about",
  },
};
const ICON_MAP: Record<string, React.ElementType> = {
  Zap, Shield, Users, Lightbulb, Settings, Workflow,
};

const ABOUT = {
  headline: "ABOUT US",
  subheadline:
    "We're obsessed with saving your time — so your team can focus on the work that actually needs a human.",
  image: "/images/about-main.png",
  story: [
    "CognitoByte is an AI automation agency based in Islamabad, Pakistan. We build n8n workflows, AI agents, and chatbots that handle the repetitive work — so your team can focus on the work that actually needs a human.",
    "CognitoByte started with a simple observation: most businesses waste hours every week on tasks that don't need a human doing them — copying data between tools, posting the same type of content, answering the same customer questions over and over.",
    "We build automation systems, AI agents, and chatbots that take that work off your plate — using tools like n8n, modern AI models, and clean, maintainable architecture. Everything we build is designed to be managed through simple dashboards, not endless code changes, so you stay in control without needing to become a developer.",
    "Our approach is practical: audit what's actually slowing you down, build a solution specific to your business, and hand it off in a way you can actually use.",
  ],
  values: [
    {
      icon: "Zap",
      title: "Practical Over Flashy",
      description: "We build systems that solve real problems, not automation for the sake of it.",
    },
    {
      icon: "Settings",
      title: "Transparency",
      description: "No black-box solutions. You understand and control what we build for you.",
    },
    {
      icon: "Workflow",
      title: "Built to Last",
      description: "Automations designed to keep running with minimal upkeep, not fall apart after launch.",
    },
  ],
};

export default function AboutPage() {
  return (
    <div className="pt-16">
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="label-tag mb-6">About Us</div>
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-950 mb-6 leading-tight">
                {ABOUT.headline}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {ABOUT.subheadline}
              </p>
              <Link href="/contact" className="btn-primary">
                Start a Project <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              {ABOUT.image && (
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={ABOUT.image}
                    alt="About CognitoByte"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="section-padding bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="prose-custom space-y-4">
            {ABOUT.story.map((p, i) => (
              <p key={i} className="text-gray-700 leading-relaxed">{p}</p>
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding bg-white">
        <div className="container-tight">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-950 mb-3">How We Work</h2>
            <p className="text-gray-500 text-lg">The principles that guide every project we take on.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ABOUT.values.map((v, i) => {
              const IconComponent = ICON_MAP[v.icon] || Zap;
              return (
                <div key={i} className="card p-7">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                    <IconComponent className="w-5 h-5 text-brand-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{v.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
function AboutIllustration() {
  return (
    <div className="grid grid-cols-2 gap-4">
      
      {[
        { label: "Automations Built", value: "50+" },
        { label: "Hours Saved", value: "2000+" },
        { label: "Happy Clients", value: "30+" },
        { label: "Countries", value: "8+" },
      ].map((stat, i) => (
        <div key={i} className="card p-6 text-center">
          
          <p className="text-4xl font-bold text-brand-500 mb-1">
            {stat.value}
          </p>
          <p className="text-gray-500 text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
