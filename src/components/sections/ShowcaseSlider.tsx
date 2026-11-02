"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Activity, ShieldCheck, Zap } from "lucide-react";

interface Slide {
  id: number;
  tag: string;
  tagColor: string;
  title: string;
  subtitle: string;
  image: string;
  metrics: { label: string; value: string; icon: React.ElementType }[];
  ctaText: string;
  ctaLink: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tag: "Autonomous Orchestration",
    tagColor: "from-brand-500 to-indigo-500",
    title: "Enterprise AI Workflow Engines That Never Sleep",
    subtitle:
      "Deeply connected n8n pipelines and custom API engines that eliminate 20+ hours of manual labor per week. Synchronize lead routing, invoicing, and cross-platform actions automatically.",
    image: "/images/ai-automation-banner.jpg",
    metrics: [
      { label: "Manual Effort Cut", value: "85%", icon: Zap },
      { label: "Pipeline Reliability", value: "99.9%", icon: ShieldCheck },
    ],
    ctaText: "Explore Workflows",
    ctaLink: "/projects",
  },
  {
    id: 2,
    tag: "Multi-Agent Intelligence",
    tagColor: "from-purple-500 to-pink-500",
    title: "Collaborative AI Swarms Built for Complex Decisioning",
    subtitle:
      "Deploy intelligent agents capable of real-time web exploration, automated qualification, multi-step customer support, and direct CRM execution with dynamic context memory.",
    image: "/images/ai-agent-network.jpg",
    metrics: [
      { label: "Execution Velocity", value: "10x", icon: Activity },
      { label: "Active Coverage", value: "24/7", icon: Sparkles },
    ],
    ctaText: "View Agent Systems",
    ctaLink: "/services",
  },
  {
    id: 3,
    tag: "Observability & Control",
    tagColor: "from-emerald-500 to-teal-500",
    title: "Unified Command Center & High-Throughput Telemetry",
    subtitle:
      "Full visibility over every prompt execution, token spend, error recovery, and data sync. Designed with enterprise-grade sandboxing and zero unauthorized leaks.",
    image: "/images/ai-command-center.jpg",
    metrics: [
      { label: "Average Token Latency", value: "<150ms", icon: Zap },
      { label: "Data Sandbox Check", value: "100%", icon: ShieldCheck },
    ],
    ctaText: "See Enterprise Pricing",
    ctaLink: "/pricing",
  },
];

export function ShowcaseSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const slide = SLIDES[current];

  return (
    <section className="relative py-20 bg-[#08090f] overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Interactive Innovation Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Architecting the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400">Autonomous Business</span>
          </h2>
          <p className="mt-4 text-gray-400 text-sm sm:text-base leading-relaxed">
            Discover how CognitoByte combines modern AI agent architectures, self-healing workflows, and custom telemetry to automate entire business departments.
          </p>
        </div>

        {/* Carousel Card */}
        <div
          className="relative bg-gradient-to-br from-gray-900/90 via-gray-900/60 to-gray-950/90 rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-xl overflow-hidden group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Subtle perimeter glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-700 pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                {/* Tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r mb-6 shadow-sm shadow-brand-500/20"
                  style={{
                    backgroundImage: current === 0 
                      ? "linear-gradient(to right, #0284c7, #4f46e5)" 
                      : current === 1 
                      ? "linear-gradient(to right, #9333ea, #db2777)" 
                      : "linear-gradient(to right, #059669, #0d9488)"
                  }}
                >
                  <Sparkles className="w-3 h-3 text-white" />
                  <span>{slide.tag}</span>
                </div>

                {/* Title */}
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight transition-all duration-500">
                  {slide.title}
                </h3>

                {/* Subtitle */}
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8">
                  {slide.subtitle}
                </p>

                {/* Metrics Badges */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {slide.metrics.map((metric, idx) => {
                    const Icon = metric.icon;
                    return (
                      <div
                        key={idx}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center gap-2 text-brand-400 mb-1">
                          <Icon className="w-4 h-4" />
                          <span className="text-xs text-gray-400 font-medium">{metric.label}</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          {metric.value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={slide.ctaLink}
                  className="btn-primary inline-flex items-center gap-2 group/btn"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>

                <Link
                  href="/contact"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <span>Schedule Consultation</span>
                </Link>
              </div>
            </div>

            {/* Right Image Display */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[16/10] sm:aspect-[16/10] rounded-2xl overflow-hidden border border-white/15 shadow-2xl group/img">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Luminous overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Floating pill badge on image */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-white tracking-wide">
                      Live CognitoByte Architecture
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400">
                    Slide {current + 1} of {SLIDES.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Controls Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Dots */}
            <div className="flex items-center gap-2.5">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === current
                      ? "w-8 bg-gradient-to-r from-brand-400 to-indigo-400 shadow-md shadow-brand-500/50"
                      : "w-2.5 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Nav Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

