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
export default async function PricingPage() {
  const data = await getPricingFromDb();
  return (
    <div className="pt-16">
      
      {/* Header */}
      <section className="bg-white py-24 px-4 text-center border-b border-gray-100">
        
        <div className="label-tag mb-6 mx-auto w-fit">Pricing</div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-950 mb-4">
          
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto">
          
          No hidden fees. No surprises. Pick a plan and start automating within
          days.
        </p>
      </section>
      {/* Plans */}
      <section className="section-padding bg-gray-50">
        
        <div className="max-w-5xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {data
              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
              .map((plan: any) => (
                <div
                  key={plan.name}
                  className={cn(
                    "rounded-2xl border p-8 relative",
                    plan.isPopular
                      ? "bg-brand-500 border-brand-600 shadow-2xl shadow-brand-500/30 scale-105"
                      : "bg-white border-gray-100 shadow-sm",
                  )}
                >
                  
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      
                      <span className="bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                        
                        ★ Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    
                    <h3
                      className={cn(
                        "text-lg font-bold mb-1",
                        plan.isPopular ? "text-white" : "text-gray-900",
                      )}
                    >
                      
                      {plan.name}
                    </h3>
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        plan.isPopular ? "text-brand-100" : "text-gray-500",
                      )}
                    >
                      
                      {plan.description}
                    </p>
                  </div>
                  <div className="mb-8">
                    
                    <span
                      className={cn(
                        "text-5xl font-bold",
                        plan.isPopular ? "text-white" : "text-gray-950",
                      )}
                    >
                      
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span
                        className={cn(
                          "text-sm ml-1",
                          plan.isPopular ? "text-brand-100" : "text-gray-500",
                        )}
                      >
                        
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        
                        <CheckCircle2
                          className={cn(
                            "w-4 h-4 shrink-0 mt-0.5",
                            plan.isPopular
                              ? "text-brand-200"
                              : "text-brand-500",
                          )}
                        />
                        <span
                          className={
                            plan.isPopular ? "text-brand-100" : "text-gray-700"
                          }
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={cn(
                      "w-full text-center font-bold py-3 rounded-xl transition-all inline-block",
                      plan.isPopular
                        ? "bg-white text-brand-600 hover:bg-brand-50"
                        : "bg-brand-500 text-white hover:bg-brand-600",
                    )}
                  >
                    
                    {plan.ctaText || "Get Started"}
                  </Link>
                </div>
              ))}
          </div>
          {/* FAQ / Note */}
          <div className="mt-16 text-center">
            
            <p className="text-gray-500 text-sm mb-4">
              
              All plans include a free 30-minute onboarding call. Not sure which
              plan fits? Let&apos;s talk.
            </p>
            <Link href="/contact" className="btn-secondary">
              
              Talk to us first <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
