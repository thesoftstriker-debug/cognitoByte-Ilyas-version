"use client";
import React from "react";
import { Cpu, Zap, Bot, Database, Workflow, ShieldCheck, Sparkles, Layers, MessageSquare, Terminal } from "lucide-react";

const TECH_ITEMS = [
  { name: "n8n Automation", icon: Workflow, color: "text-red-400 border-red-500/20 bg-red-500/10" },
  { name: "OpenAI GPT-4o", icon: Sparkles, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  { name: "Anthropic Claude", icon: Bot, color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
  { name: "Groq LPU (Ultra-Fast)", icon: Zap, color: "text-orange-400 border-orange-500/20 bg-orange-500/10" },
  { name: "WhatsApp Cloud API", icon: MessageSquare, color: "text-green-400 border-green-500/20 bg-green-500/10" },
  { name: "MongoDB Atlas", icon: Database, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
  { name: "LangChain Agents", icon: Cpu, color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10" },
  { name: "Next.js 14 Fullstack", icon: Terminal, color: "text-white border-white/20 bg-white/10" },
  { name: "Enterprise Security", icon: ShieldCheck, color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10" },
  { name: "Custom API Pipelines", icon: Layers, color: "text-brand-400 border-brand-500/20 bg-brand-500/10" },
];

export function TechMarquee() {
  return (
    <div className="relative py-8 bg-[#090b14] border-y border-white/5 overflow-hidden">
      {/* Side gradient fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-[#090b14] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-[#090b14] to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-shimmer" style={{ animation: "marquee 35s linear infinite" }}>
        {[...TECH_ITEMS, ...TECH_ITEMS, ...TECH_ITEMS].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 mx-3 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all hover:scale-105 cursor-default select-none ${item.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
}

