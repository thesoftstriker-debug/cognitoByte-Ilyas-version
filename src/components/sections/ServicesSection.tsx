import Link from "next/link";
import { ArrowRight, Zap, Bot, MessageSquare, Workflow, Brain, Settings } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Zap, Bot, MessageSquare, Workflow, Brain, Settings,
};

export function ServicesSection({ services }: { services: any[] }) {
  return (
    <section className="section-padding bg-white">
      
      <div className="container-tight">
        
        {/* Header */}
        <div className="text-center mb-14">
          
          <div className="label-tag mb-4 mx-auto w-fit">What We Do</div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-950 mb-4 max-w-3xl mx-auto">
            EVERYTHING YOU NEED TO{" "}
            <span className="gradient-text">AUTOMATE AND SCALE</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            
            From simple task automation to full AI agent deployments — we build
            it all, end-to-end.
          </p>
        </div>
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {services.map((service, i) => {
            const IconComponent = ICON_MAP[service.icon] || Zap;
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="card p-7 group cursor-pointer hover:border-brand-300 hover:ring-1 hover:ring-brand-200"
              >
                
                <div className="flex items-start gap-4">
                  
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 group-hover:bg-brand-500 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-brand-500/30">
                    
                    <IconComponent className="w-6 h-6 text-brand-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                      
                      {service.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      
                      {service.shortDescription}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center text-brand-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1">
                  
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
        <div className="text-center mt-10">
          
          <Link href="/services" className="btn-secondary">
            
            View All Services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
