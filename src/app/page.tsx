import { getServicesFromDb, getProjectsFromDb } from "@/lib/data";
import { findAllProducts } from "@/lib/models/Product";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { ProjectsPreview } from "@/components/sections/ProjectsPreview";
import { ProductsPreview } from "@/components/sections/ProductsPreview";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { StatsSection } from "@/components/sections/StatsSection";
import type { Metadata } from "next";

// Revalidate every 5 minutes — balances fresh DB data with fast page loads
export const revalidate = 300;

export const metadata: Metadata = {
  title: "AI Automation Agency | Chatbots, AI Agents & n8n Workflows",
  description:
    "CognitoByte builds AI automation systems, custom chatbots, and n8n workflows that save businesses time and cut manual work — fast, affordable, and tailored to you.",
  alternates: {
    canonical: "/",
  },
};

const HERO = {
  headline: "We Build AI That Works While You Sleep",
  subheadline:
    "CognitoByte automates your repetitive tasks using n8n, AI agents, and custom chatbots — so your team can focus on what actually matters.",
  ctaPrimary: "View Our Work",
  ctaSecondary: "See Pricing",
  image: "/images/hero-main.png",
  stats: [
    { value: "50+", label: "Automations Built" },
    { value: "10x", label: "Average Time Saved" },
    { value: "100%", label: "Client Satisfaction" },
  ],
};

export default async function HomePage() {
  const services = await getServicesFromDb();
  const projects = await getProjectsFromDb();
  const { products } = await findAllProducts(undefined, undefined, 1, 3);
  return (
    <>
      <HeroSection hero={HERO} /> <StatsSection stats={HERO.stats} />
      <ServicesSection services={services} />
      <ProjectsPreview projects={projects.slice(0, 3)} />
      <ProductsPreview products={products as unknown as Array<{ name: string; slug: string; description: string; price: number; category: string; imageUrl?: string }>} />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
