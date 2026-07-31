import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
export function CtaSection() {
  return (
    <section className="section-padding bg-brand-500">
      
      <div className="container-tight text-center">
        
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
          
          Ready to automate your business?
        </h2>
        <p className="text-brand-100 text-sm sm:text-base max-w-xl mx-auto mb-8">
          
          Book a free 30-minute discovery call. We&apos;ll map out exactly which
          automations would save you the most time.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-brand-600 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
          >
            
            <Calendar className="w-4 h-4" /> Book a Free Call
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-white border border-white/30 hover:bg-white/10 font-semibold px-8 py-4 rounded-xl transition-colors"
          >
            
            See Our Work <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
