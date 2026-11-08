import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { getPricingFromDb } from "@/lib/data";
import { cn } from "@/lib/utils";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for AI automation services. Choose a plan that fits your business.",
  alternates: {
    canonical: "/pricing",
  },
};

const FAQS = [
  {
    q: "How long does a project take?",
    a: "Starter automations ship in 5-10 business days, WhatsApp chatbots in 2-3 weeks, and full-stack web apps in 4-8 weeks depending on scope.",
  },
  {
    q: "Do you offer a free consultation?",
    a: "Yes. Every plan includes a free 30-minute discovery call where we audit your workflow, identify what is worth automating, and recommend the right solution.",
  },
  {
    q: "Who owns the code and workflows?",
    a: "You do. Code and automation workflows are handed over on delivery and are built in your own accounts wherever possible, so there is no vendor lock-in.",
  },
  {
    q: "Can you integrate with the tools I already use?",
    a: "Yes. We connect 400+ apps through n8n, including Shopify, Google Sheets, CRMs, Slack, Stripe, and any service that exposes a REST API.",
  },
  {
    q: "Do prices include support after launch?",
    a: "Yes. Every project includes a post-launch support window for fixes and adjustments. Ongoing maintenance and monitoring plans are also available.",
  },
  {
    q: "What if I am not sure which plan fits?",
    a: "Start with the free discovery call. We will scope your use case and tell you honestly whether the Starter, Growth, or a custom build is the right fit.",
  },
  {
    q: "Do you build custom projects outside these plans?",
    a: "Yes. Enterprise AI systems, multi-step agents, and full-stack web applications are scoped custom after a short technical conversation.",
  },
];

export default async function PricingPage() {
  const data = await getPricingFromDb();
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
  return (
    <div className="pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      
      {/* Header */}
      <section className="relative bg-gradient-to-b from-[#0c0e1a] via-[#08090f] to-[#08090f] py-24 px-4 text-center border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="relative max-w-3xl mx-auto">
          <div className="label-tag mb-6 mx-auto w-fit">Transparent Pricing</div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-5 tracking-tight">
            Predictable plans. Real ROI.
          </h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
            No hidden fees. No surprises. Pick a plan and start automating within days.
          </p>
        </div>
      </section>
      {/* Plans */}
      <section className="section-padding bg-[#08090f]">
        
        <div className="max-w-5xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {!data.length && <p className="col-span-full py-24 text-center text-gray-400 bg-gray-900/40 rounded-3xl border border-white/10">Data is currently unavailable. Please try again later.</p>}
            {data
              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
              .map((plan: any) => (
                <div
                  key={plan.name}
                  className={cn(
                    "rounded-3xl border p-8 relative flex flex-col justify-between transition-all duration-300 backdrop-blur-xl",
                    plan.isPopular
                      ? "bg-gradient-to-b from-gray-900 via-[#0d1226] to-gray-900 border-2 border-brand-400 text-white shadow-[0_0_50px_rgba(2,132,199,0.35)] md:-translate-y-3 md:scale-105"
                      : "bg-gray-900/80 border-white/10 hover:border-brand-500/50 hover:shadow-[0_0_35px_rgba(79,110,247,0.22)] hover:-translate-y-1 text-white",
                  )}
                >
                  
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider px-4 py-1 rounded-full whitespace-nowrap shadow-md">
                        ★ Most Popular
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="mb-6">
                      <h3
                        className="text-xl font-bold mb-2 text-white"
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          plan.isPopular ? "text-brand-100" : "text-gray-400",
                        )}
                      >
                        {plan.description}
                      </p>
                    </div>
                    <div className="mb-8">
                      <span
                        className="text-5xl font-black tracking-tight text-white"
                      >
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span
                          className={cn(
                            "text-sm font-medium ml-1",
                            plan.isPopular ? "text-brand-200" : "text-gray-400",
                          )}
                        >
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-3.5 mb-8">
                      {plan.features?.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <CheckCircle2
                            className={cn(
                              "w-4 h-4 shrink-0 mt-0.5",
                              plan.isPopular
                                ? "text-brand-200"
                                : "text-brand-400",
                            )}
                          />
                          <span
                            className={
                              plan.isPopular ? "text-brand-100" : "text-gray-300"
                            }
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/contact"
                    className={cn(
                      "w-full text-center font-bold py-3.5 rounded-xl transition-all duration-200 inline-block",
                      plan.isPopular
                        ? "btn-primary shadow-xl shadow-brand-500/25"
                        : "btn-secondary",
                    )}
                  >
                    {plan.ctaText || "Get Started"}
                  </Link>
                </div>
              ))}
          </div>
          {/* FAQ / Note */}
          <div className="mt-16 text-center">
            
            <p className="text-gray-400 text-sm mb-4">
              All plans include a free 30-minute onboarding call. Not sure which
              plan fits? Let&apos;s talk.
            </p>
            <Link href="/contact" className="btn-secondary">
              Talk to us first <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-[#090b14] border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="label-tag mb-4 mx-auto w-fit">FAQ</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
              Questions, answered
            </h2>
            <p className="text-gray-400">The things clients ask before starting a project.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6 transition-colors open:border-brand-500/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-white">
                  <span>{faq.q}</span>
                  <span className="text-xl leading-none text-brand-400 transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
